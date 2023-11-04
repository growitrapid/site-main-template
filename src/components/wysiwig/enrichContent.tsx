"use server";

import { load } from "cheerio";
import { decode } from "html-entities";
import { Heading } from "./";
import Prism from "prismjs";

const slugify = (str: string): string =>
    str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

function addHeading(heading: Heading, parent: Heading[]) {
    const lastHeading = parent[parent.length - 1];

    if (lastHeading) {
        if (lastHeading.type < heading.type) {
            addHeading(heading, lastHeading.children);
        } else {
            parent.push(heading);
        }
    } else {
        parent.push(heading);
    }
}

/**
 * The set of all languages which have been loaded using the below function.
 *
 * @type {Set<string>}
 */
const loadedLanguages = new Set<string>();

export async function enrichContent(content: string): Promise<{ headings?: Heading[], data: string }> {
    "use server";
    var newdata = content;

    // Load cheerio
    const $ = load(content, null, false);

    /**
     * Get each codeblock that has a language class
     * & highlight it with prismjs
     * 
     * To fetch language files: require("prismjs/components/prism-" + lang);
     * If language is not found, highlight with default language
     * 
     * @see https://prismjs.com/
     */
    const $codes = $('code[class^=language]');
    if ($codes.length > 0) {
        $codes.each(function () {
            const $code = $(this);
            let lang = $code.attr('class')?.replace('language-', '') || '';
            const code = decode($code.html());

            // the user might have loaded languages via some other way or used `prism.js` which already includes some
            // we don't need to validate the ids because `getLoader` will ignore invalid ones
            const loaded = [...Array.from(loadedLanguages), ...Object.keys(Prism.languages)];

            // load the language if it hasn't been loaded yet
            if (!loaded.includes(lang)) {
                try {
                    // default loaded languages with prisma, skip to decrease build times
                    if (!['javascript', 'css', 'clike', 'markup'].includes(lang))
                        require("prismjs/components/prism-" + lang);
                    console.log('Prismjs loaded language', lang);
                    loadedLanguages.add(lang);
                } catch (e: any) {
                    console.error(e);
                    console.log('Prismjs error, loading default languages plane text');
                    lang = '';
                }
            }

            try {
                if (lang !== '') {
                    const highlighted = Prism.highlight(code, Prism.languages[lang], lang);
                    $code.html(highlighted);
                    $code.parent('pre').addClass(`language-${lang}`);
                }
            } catch (e: any) {
                console.log('Prismjs error, Cannot highlight code: ' + lang);
                console.error(e);
                $code.parent('pre').addClass(`language-text`);
            }

            // wrap code in div to add overflow-x: auto, then wrap in pre to add padding
            $code.wrap('<div class="overflow-x-auto"></div>');
        });
    }

    const $pres = $('pre[class^=language]');
    if ($pres.length > 0) {
        $pres.each(function () {
            const $pre = $(this);
            const lang = $pre.attr('class')?.replace('language-', '') || '';
            $pre.attr('data-language', lang);
        });
    }

    const headings: Heading[] = [];
    const $headings = $('h1, h2, h3, h4, h5, h6');

    if ($headings.length > 0) {
        $headings.each(function () {
            const $heading = $(this);

            // Add id to heading
            const id = slugify($heading.text());
            $heading.attr('id', id);

            // Get heading number (h1, h2, h3, etc) => 1, 2, 3, etc
            const headingNumber = parseInt($heading.prop('tagName').toLocaleLowerCase().replace('h', ''));

            // Create heading object
            const heading: Heading = {
                type: headingNumber as Heading['type'],
                id,
                text: $heading.text(),
                children: [],
            };

            // Add heading to headings array
            // As the children of the previous parent heading
            addHeading(heading, headings);

            // Add # to heading if it's h1 or h2
            if (headingNumber < 3) $heading.html(`<a href="#${id}">#</a>${$heading.html()}`);
        });
    }

    /**
     * Update all the changes.
     */
    newdata = $.html();

    return {
        headings,
        data: newdata
    }
}