if (!customElements.get('quick-nav')) {
  class QuickNav extends HTMLElement {
    constructor() {
      super();

      const self = this;

      this.childSelect = this.querySelector('custom-select[data-level="2"]');
      this.grandchildSelect = this.querySelector('custom-select[data-level="3"]');
      this.submitButton = this.querySelector('.js-submit');
      this.priceRange = this.querySelector('.js-quick-nav-price');
      this.zipField = this.querySelector('[data-custom-select-zip-field]');

      this.addEventListener('change', this.handleQuickNavChange);
      this.addEventListener('click', this.handleQuickNavClick);

      // If the zipField exists, populate it with the zip code from localStorage
      if (this.zipField) {
        const existingZipCode = localStorage.getItem('zipCode');
        if (existingZipCode) {
          this.zipField.value = existingZipCode;
        }

        this.zipField.addEventListener('blur', (evt) => {
          localStorage.setItem('zipCode', evt.target.value);
          if (self.url) {
            self.updateSubmitButton(self.url, true);
            self.parseCollectionInfo(self.url, true);
          }
        });

        // Init a timeout variable to be used below
        let timeout = null;

        // Listen for keystroke events
        this.zipField.addEventListener('keyup', function (e) {
          // Clear the timeout if it has already been set.
          // This will prevent the previous task from executing
          // if it has been less than <MILLISECONDS>
          clearTimeout(timeout);

          // Make a new timeout set to go off in 1000ms (1 second)
          timeout = setTimeout(function () {
            localStorage.setItem('zipCode', self.zipField.value);
            self.updateSubmitButton(self.url);
            self.parseCollectionInfo(self.url);
          }, 1000);
        });
      }
    }

    /**
     * Pauses an auto-playing slideshow
     */
    handleQuickNavClick() {
      const slideshowElem = this.closest('slide-show');
      if (slideshowElem && slideshowElem.dataset.autoplay === 'true') {
        const autoplayBtn = slideshowElem.querySelector('.autoplay-btn');
        if (autoplayBtn) autoplayBtn.click();
      }
    }

    /**
     * Handles when anything in the quick nav is changed (one of the selects)
     * @param {object} evt - Event object
     */
    handleQuickNavChange(evt) {
      if (evt.target.matches('custom-select') && evt.detail.selectedValue) {
        const selectedOption = evt.target.querySelector('[aria-selected="true"]');
        this.url = selectedOption.dataset.url;

        let datasetUrl = this.url;

        this.updateSubmitButton(datasetUrl);

        if (selectedOption.dataset.isCollection) {
          this.parseCollectionInfo(datasetUrl);
        } else {
          this.unparseCollectionInfo();
        }

        if (evt.target.dataset.level === '1' && this.childSelect) {
          QuickNav.prepareSelect(this.childSelect, evt.detail.selectedValue);
          QuickNav.resetSelect(this.grandchildSelect, true);
        } else if (evt.target.dataset.level === '2' && this.grandchildSelect) {
          QuickNav.prepareSelect(this.grandchildSelect, evt.detail.selectedValue);
        }

        // Check to see if all selects have been selected
        let totalPossibleSelects = 1;
        if (this.childSelect) totalPossibleSelects += 1;
        if (this.grandchildSelect) totalPossibleSelects += 1;
        const selectedOptions = this.querySelectorAll('[aria-selected="true"]');
        if (selectedOptions.length > 0) {
          this.zipField.disabled = false;
        }
      } else if (evt.target.closest('.price-range')) {
        const priceRangeMin = this.priceRange.querySelector("[name='filter.v.price.gte']").value;
        const priceRangeMax = this.priceRange.querySelector("[name='filter.v.price.lte']").value;

        let url = this.url; // eslint-disable-line

        if (window.localZipCodes) {

        }

        if (priceRangeMin) {
          url = url.includes('?') ? `${url}&` : `${url}?`;
          url += `filter.v.price.gte=${priceRangeMin}`;
        }
        if (priceRangeMax) {
          url = url.includes('?') ? `${url}&` : `${url}?`;
          url += `filter.v.price.lte=${priceRangeMax}`;
        }
        this.updateSubmitButton(url);
        this.parseCollectionInfo(url);
      } else {
        if (!evt.target.matches('input')) {
          QuickNav.resetSelect(evt.target, false);
        }
        if (this.url) {
          this.updateSubmitButton(this.url);
          this.parseCollectionInfo(this.url);
        }
      }
    }

    /**
     * Dynamically load the price range slider and updates the number of results
     * @param {string} url - Collection url to fetch
     * @returns {Promise<void>}
     */
    async parseCollectionInfo(url, clearZipIfInvalid) {

      url = this.adjustUrlForZipCode(url, clearZipIfInvalid);

      this.submitButton.ariaDisabled = 'true';
      this.submitButton.classList.add('is-loading');
      let preventButtonEnable = false;

      // Fetch collection page
      const response = await fetch(url);
      if (response.ok) {
        const tmpl = document.createElement('template');
        tmpl.innerHTML = await response.text();

        const productsContainer = tmpl.content.querySelector('[data-num-results]');
        if (productsContainer) {
          const numResults = parseInt(productsContainer.dataset.numResults, 10);
          if (numResults === 0) {
            this.submitButton.textContent = theme.strings.quickNav.show_products_none;
            preventButtonEnable = true;
          } else if (numResults === 1) {
            this.submitButton.textContent = theme.strings.quickNav.button_one.replace(
              '[quantity]',
              numResults
            );
          } else {
            this.submitButton.textContent = theme.strings.quickNav.button_other.replace(
              '[quantity]',
              numResults
            );
          }
        } else {
          // eslint-disable-next-line
          console.warn(
            'Enterprise Theme: An element with [data-num-results] could not be found on the product page.',
            url
          );
        }

        if (this.dataset.showPrice) {
          const priceRangeElem = tmpl.content.querySelector('price-range');
          if (priceRangeElem) {
            this.priceRange.innerHTML = priceRangeElem.outerHTML;
            const maxHeight = this.priceRange.querySelector('.price-range').clientHeight;
            this.priceRange.style.maxHeight = `${parseInt(maxHeight, 10) + 1}px`;
          } else {
            // eslint-disable-next-line
            console.warn(
              'Enterprise Theme: No price ranger slider could be found for collection.',
              url
            );
          }
        }
      }

      if (!preventButtonEnable) this.submitButton.removeAttribute('aria-disabled');
      this.submitButton.classList.remove('is-loading');
    }

    /**
     * Hides the price range slider
     */
    unparseCollectionInfo() {
      if (this.priceRange) this.priceRange.style.maxHeight = '0px';
      this.submitButton.textContent = theme.strings.quickNav.button_standard;
    }

    /**
     * Gets a select ready to be opened (hides irrelevant options, etc)
     * @param {object} selectElem - The select to be prepared
     * @param {string} value - The handle of the parent dropdown to filter available options by
     */
    static prepareSelect(selectElem, value) {
      let hasOptions = false;
      let counter = 0;

      // Show only the relevant options
      selectElem
        .querySelectorAll('.custom-select__option:not(.quick-nav__default-option)')
        .forEach((childLink) => {
          if (childLink.dataset.parentHandle === value) {
            hasOptions = true;
            childLink.style.display = '';
            counter += 1;
          } else {
            childLink.style.display = 'none';
          }
        });

      const listbox = selectElem.querySelector('.quick-nav__listbox');
      listbox.setAttribute('data-link-count', counter < 5 ? counter : 'loads');

      QuickNav.resetSelect(selectElem, !hasOptions);

      if (hasOptions) {
        selectElem.querySelector('.custom-select__btn').removeAttribute('disabled');
      }
    }

    /**
     * Adjusts the URL for the zip code
     */
    adjustUrlForZipCode(url, clearIfInvalid) {
      if (window.localZipCodes) {

        const zipCodeValue = this.zipField.value;

        const zipCodeIsDomestic = (zipCode) => {

          // Check if ZipCode is numeric, if not, then it is international
          if (isNaN(zipCode)) {
            return false;
          }

          // Check if ZipCode is NOT in the range of US Zip Codes. If not, then it is international
          // The range of zip codes in the United States is 00501 to 99950
          if (zipCode < 501 || zipCode > 99950) {
            return false;
          }

          // GUAM
          // Check if zipcode is in the range of Guam zip codes. If so, then it is international
          // All Guam zip codes are in the range 96910–96932
          if (zipCode >= 96910 && zipCode <= 96932) {
            return false;
          }

          // PUERTO RICO
          // Check if zipcode is in the range of Puerto Rico zip codes. If so, then it is international
          // Puerto Rico is allocated the ZIP codes 00600 to 00799 and 00900 to 00999
          if ((zipCode >= 600 && zipCode <= 799) || (zipCode >= 900 && zipCode <= 999)) {
            return false;
          }

          // AMERICAN SAMOA
          // Check if zipcode is in the range of American Samoa zip codes. If so, then it is international
          // American Samoa (postal abbreviation AS) uses zip code 96799
          if (zipCode === 96799) {
            return false;
          }

          // NORTHERN MARIANA ISLANDS
          // Check if zipcode is in the range of Northern Mariana Islands zip codes. If so, then it is international
          // Northern Mariana Islands postal code range goes from 96950 to 96952
          if (zipCode >= 96950 && zipCode <= 96952) {
            return false;
          }

          // US VIRGIN ISLANDS
          // Check if zipcode is in the range of US Virgin Islands zip codes. If so, then it is international
          // The 008xx codes are allocated to the nearby United States Virgin Islands
          if (zipCode >= 800 && zipCode <= 899) {
            return false;
          }

          // // APO, AE
          // // The zip code range for AE (Armed Forces Europe) is 09001–09910
          if (zipCode >= 9001 && zipCode <= 9910) {
            return false;
          }

          // APO, AP
          // APO AP: The zip code range for the Japan/Korea/Pacific Islands/Far East is 96201-96645
          if (zipCode >= 96200 && zipCode <= 96645) {
            return false;
          }

          // APO, AA
          // APO AA: The zip code range for the Armed Forces of the Americas is 34038-34078
          if (zipCode >= 34038 && zipCode <= 34078) {
            return false;
          }

          // FPO, AA
          const fpoAA = [
            34007,
            34009,
            34010,
            34058,
            34080,
            34081,
            34082,
            34083,
            34084,
            34085,
            34086,
            34087,
            34088,
            34089,
            34090,
            34091,
            34092,
            34093,
            34094,
            34095
          ];
          if (fpoAA.includes(zipCode)) {
            return false;
          }



          // FPO, AP
          const fpoAP = [
            96212,
            96269,
            96306,
            96310,
            96311,
            96315,
            96321,
            96322,
            96346,
            96347,
            96349,
            96350,
            96351,
            96362,
            96370,
            96371,
            96372,
            96373,
            96374,
            96375,
            96377,
            96379,
            96380,
            96382,
            96384,
            96385,
            96387,
            96388,
            96389,
            96510,
            96511,
            96516,
            96517,
            96522,
            96531,
            96534,
            96537,
            96540,
            96542,
            96543,
            96578,
            96595,
            96598,
            96601,
            96602,
            96603,
            96604,
            96605,
            96606,
            96607,
            96608,
            96609,
            96610,
            96611,
            96612,
            96613,
            96615,
            96616,
            96617,
            96619,
            96620,
            96628,
            96629,
            96632,
            96643,
            96649,
            96650,
            96657,
            96660,
            96661,
            96662,
            96663,
            96664,
            96665,
            96666,
            96667,
            96668,
            96669,
            96670,
            96671,
            96672,
            96673,
            96674,
            96675,
            96677,
            96678,
            96679,
            96681,
            96682,
            96683,
            96686,
            96691,
            96692,
            96693,
            96694,
            96695,
            96696,
            96698
          ];
          if (fpoAP.includes(zipCode)) {
            return false;
          }


          // FPO, AE
          const fpoAE = [
            '09204',
            '09216',
            '09241',
            '09266',
            '09363',
            '09410',
            '09424',
            '09501',
            '09502',
            '09503',
            '09504',
            '09505',
            '09506',
            '09507',
            '09508',
            '09509',
            '09510',
            '09511',
            '09512',
            '09513',
            '09514',
            '09516',
            '09517',
            '09520',
            '09522',
            '09523',
            '09524',
            '09532',
            '09534',
            '09543',
            '09550',
            '09554',
            '09556',
            '09564',
            '09565',
            '09566',
            '09567',
            '09568',
            '09569',
            '09570',
            '09573',
            '09574',
            '09575',
            '09576',
            '09577',
            '09578',
            '09579',
            '09581',
            '09582',
            '09583',
            '09586',
            '09587',
            '09588',
            '09589',
            '09590',
            '09591',
            '09592',
            '09593',
            '09594',
            '09595',
            '09596',
            '09599',
            '09607',
            '09608',
            '09609',
            '09617',
            '09618',
            '09620',
            '09621',
            '09622',
            '09623',
            '09625',
            '09626',
            '09627',
            '09631',
            '09636',
            '09645',
            '09647',
            '09648',
            '09649',
            '09712',
            '09729',
            '09733',
            '09761',
            '09805',
            '09834',
            '09837',
            '09838',
            '09859',
            '09865',
            '09902'
          ];
          if (fpoAE.includes(zipCode)) {
            return false;
          }

          // If none of the above conditions are met, then the zip code is domestic
          return true;

        }

        // Check if the zip code is in the local list
        if (window.localZipCodes.includes(zipCodeValue)) {
          url = url.includes('?') ? `${url}&` : `${url}?`;
          url += `filter.p.m.custom.shipping_type=Direct+Ship`;
          url += `&filter.p.m.custom.shipping_type=Direct+Floral`;
          url += `&filter.p.m.custom.shipping_type=Non-Direct+Ship`;
          url += `&filter.p.m.custom.shipping_type=Exclusive`;

          // Check if the zip code is domestic
        } else if (zipCodeIsDomestic(zipCodeValue)) {
          url = url.includes('?') ? `${url}&` : `${url}?`;
          url += `filter.p.m.custom.shipping_type=Direct+Ship`;
          url += `&filter.p.m.custom.shipping_type=Direct+Floral`;
          url += `&filter.p.m.custom.shipping_type=Non-Direct+Ship`;
          // url += `&filter.p.m.custom.shipping_type=Exclusive`;

          // Check if the zip code is international
        } else {
          url = url.includes('?') ? `${url}&` : `${url}?`;
          url += `filter.p.m.custom.shipping_type=Direct+Ship`;
          // url += `&filter.p.m.custom.shipping_type=Direct+Floral`;
          url += `&filter.p.m.custom.shipping_type=Non-Direct+Ship`;
          // url += `&filter.p.m.custom.shipping_type=Exclusive`;
        }
      }
      return url;
    }

    /**
     * Updates the URL on the search button
     * @param {string} url - The new URL
     */
    updateSubmitButton(url, clearZipIfInvalid) {

      url = this.adjustUrlForZipCode(url, clearZipIfInvalid);

      // Update the url situation
      if (url && url.length > 0 && url !== '#') {
        this.submitButton.href = url;
        this.submitButton.removeAttribute('aria-disabled');
      } else {
        this.submitButton.href = '#';
        this.submitButton.setAttribute('aria-disabled', 'true');
      }
    }

    /**
     * Resets a select back to its default state
     * @param {object} selectElem - The select element to reset
     * @param {boolean} disable - Whether the select should be disabled or not
     */
    static resetSelect(selectElem, disable) {
      if (selectElem) {
        const listbox = selectElem.querySelector('.custom-select__listbox');
        listbox.removeAttribute('aria-activedescendant');

        const selectedOption = selectElem.querySelector('[aria-selected="true"]');
        if (selectedOption) {
          selectedOption.setAttribute('aria-selected', 'false');
        }

        const label = selectElem.querySelector('.custom-select__btn span');
        label.textContent = label.dataset.defaultText;
        if (disable) {
          selectElem.querySelector('.custom-select__btn').setAttribute('disabled', 'disabled');
        }

        selectElem.init();
      }
    }
  }

  customElements.define('quick-nav', QuickNav);
}
