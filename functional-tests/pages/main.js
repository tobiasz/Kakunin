'use strict';

const { BasePage } = require('kakunin');

class MainPage extends BasePage {
  constructor() {
    super();

    this.url = '/';

    this.linkDivs = $$('.available-examples-links');
    this.formLink = $('a[href="/form/simple"]');
    this.absolutePageLink = $('a[href="/absolute-page"]');
    this.googleLink = $('a[href="https://www.google.pl"]');
    this.tabularDataLink = $('a[href="/tabular-data"]');
    this.buttonLink = $('a[href="/form/disappear"]');
    this.valueToClick = $('.valueForClickStep');
  }
}

module.exports = new MainPage();
