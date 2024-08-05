#!/usr/bin/env node

"use strict";

const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');
const _arguments = process.argv.slice(2);
const package_info = require('../package.json');

const COLORS = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bgWhite: '\x1b[47m',
    reset: '\x1b[0m',
    resetBg: '\x1b[49m',
    bold: '\x1b[1m'
};

const CDN_URLS = {
    unpkg: 'https://unpkg.com/',
    cdnjs: 'https://cdnjs.cloudflare.com/ajax/libs',
    jsdelivr: 'https://cdn.jsdelivr.net/npm/'
};

let result = [];

const HELP_MSG = `
    ${COLORS.green}Usage: checklib [options]

    Options:${COLORS.reset}
        ${COLORS.blue}-h, --help          Show this help message and exit${COLORS.reset}
        ${COLORS.blue}-v, --version       Show the version and exit${COLORS.reset}
        ${COLORS.blue}-p, --path          Path to the html file${COLORS.reset}
            ${COLORS.yellow}--warnings-only Show only update warnings${COLORS.reset}
    `;

switch (_arguments[0]) {
    case '-h':
    case '--help':
        console.log(HELP_MSG);
        break;
    case '-v':
    case '--version':
        console.log(package_info.version);
        break;
    case '-p':
    case '--path':
        if (_arguments[1]) {
            const file = path.join(process.cwd(), _arguments[1]);

            if (fs.existsSync(file) && file.endsWith('.html')) {
                if (_arguments[2] === '--warnings-only') {
                    return check(file, true);
                }

                return check(file);
            }

            console.log(`${COLORS.red}File ${file} does not exist or the file extension is wrong.${COLORS.reset}`);
        } else {
            console.log(`${COLORS.red}Path is required${COLORS.reset}`);
        }
        break;
    default:
        console.log(HELP_MSG);
        break;
}

/**
 * Check the file content and parse the html
 * @param {String} file
 * @param {Boolean} warningsOnly
 */
function check(file, warningsOnly = false) {
    const content = fs.readFileSync(file, 'utf8');

    const REGEX = {
        script: /<script.*src="(.*)".*><\/script>/g,
        link: /<link.*href="(.*)".*>/g
    };

    const scripts = content.match(REGEX.script);
    const links = content.match(REGEX.link);

    if (scripts) {
        createArray(scripts, 'script');
    } else {
        console.log(`${COLORS.blue}[i] No scripts found${COLORS.reset}`);
    }

    if (links) {
        createArray(links, 'link');
    } else {
        console.log(`${COLORS.blue}[i] No links found${COLORS.reset}`);
    }

    checkForUpdates(warningsOnly)
}

/**
 * Create array out of the entries containing name, version and provider
 * @param {Array} entries
 */
function createArray(entries, type) {
    entries.forEach(entry => {
        let url;

        switch (type) {
            case 'script':
                url = entry
                    .match(/src="(.*)"/)[1]
                    .split(/\s+/)
                    .filter(url => url.startsWith(CDN_URLS.unpkg) || url.startsWith(CDN_URLS.cdnjs) || url.startsWith(CDN_URLS.jsdelivr));
                break;
            case 'link':
                url = entry
                    .match(/href="(.*)"/)[1]
                    .split(/\s+/)
                    .filter(url => url.startsWith(CDN_URLS.unpkg) || url.startsWith(CDN_URLS.cdnjs) || url.startsWith(CDN_URLS.jsdelivr));
                break;
        }

        if (!url.length) {
            return;
        }

        const splitted = url[0].split('/');

        if (url[0].startsWith(CDN_URLS.unpkg)) {
            const unpkg = splitted[3].split('@');

            result.push({
                name: unpkg[0],
                version: unpkg[1],
                provider: 'unpkg',
                type: type
            });
        }

        if (url[0].startsWith(CDN_URLS.cdnjs)) {
            result.push({
                name: splitted[5],
                version: splitted[6],
                provider: 'cdnjs',
                type: type
            });
        }

        if (url[0].startsWith(CDN_URLS.jsdelivr)) {
            const jsdelivr = splitted[4].split('@');

            result.push({
                name: jsdelivr[0],
                version: jsdelivr[1],
                provider: 'jsdelivr',
                type: type
            });
        }
    });
}

/**
 * Check for updates for each entry in the result
 * @param {Boolean} warningsOnly
 */
function checkForUpdates(warningsOnly) {
    result.forEach(entry => {
        switch (entry.provider) {
            case 'unpkg':
                fetch(`${CDN_URLS.unpkg}${entry.name}/package.json`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.version !== entry.version) {
                            console.log(
                                `${COLORS.yellow}! Update available for ${COLORS.bold}${COLORS.cyan}${entry.name}${COLORS.reset}${COLORS.yellow} ${COLORS.bgWhite}${entry.version}${COLORS.resetBg} -> ${COLORS.bgWhite}${data.version}${COLORS.resetBg} on ${entry.provider}${COLORS.reset}`
                            );
                        } else if (!warningsOnly) {
                            console.log(`${COLORS.green}✔ ${entry.name} is up to date! (${entry.provider})${COLORS.reset}`);
                        }
                    })
                    .catch(() => console.log(`${COLORS.red}✖ Couldn't fetch ${entry.name}${COLORS.reset}`));
                break;
            case 'cdnjs':
                fetch(`https://api.cdnjs.com/libraries/${entry.name}?fields=version`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.version !== entry.version) {
                            console.log(
                                `${COLORS.yellow}! Update available for ${COLORS.bold}${COLORS.cyan}${entry.name}${COLORS.reset}${COLORS.yellow} ${COLORS.bgWhite}${entry.version}${COLORS.resetBg} -> ${COLORS.bgWhite}${data.version}${COLORS.resetBg} on ${entry.provider}${COLORS.reset}`
                            );
                        } else if (!warningsOnly) {
                            console.log(`${COLORS.green}✔ ${entry.name} is up to date! (${entry.provider})${COLORS.reset}`);
                        }
                    })
                    .catch(() => console.log(`${COLORS.red}✖ Couldn't fetch ${entry.name}${COLORS.reset}`));
                break;
            case 'jsdelivr':
                fetch(`${CDN_URLS.jsdelivr}${entry.name}/package.json`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.version !== entry.version) {
                            console.log(
                                `${COLORS.yellow}! Update available for ${COLORS.bold}${COLORS.cyan}${entry.name}${COLORS.reset}${COLORS.yellow} ${COLORS.bgWhite}${entry.version}${COLORS.resetBg} -> ${COLORS.bgWhite}${data.version}${COLORS.resetBg} on ${entry.provider}${COLORS.reset}`
                            );
                        } else if (!warningsOnly) {
                            console.log(`${COLORS.green}✔ ${entry.name} is up to date! (${entry.provider})${COLORS.reset}`);
                        }
                    })
                    .catch(() => console.log(`${COLORS.red}✖ Couldn't fetch ${entry.name}${COLORS.reset}`));
                break;
        }
    });
}
