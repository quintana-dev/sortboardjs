/*
 * Sortboard v1.0.0
 * Release: 30/11/2014
 * Author: Jose Luis Quintana <joseluisquintana20@gmail.com>
 * https://github.com/joseluisq/sortboardjs
 * MIT Licence
 */
(function() {
  'use strict';

  if (this.Sortboard) {
    return;
  }

  var Sortboard = function(element, options) {
    this.currentFilter = 'all';
    this.elements = [];
    this.found = [];
    this.notfound = [];

    this.options = {
      gutter: 0,
      hiddenClass: '.hidden',
      itemsMatchName: 'li',
      filterComplete: null,
      sortComplete: null
    };

    this.addEvents = function() {
      var that = this;

      window.addEventListener('resize', function() {
        that.sort();
      }, false);

      that.sort();
    };

    this.setOptions = function(options) {
      this.options = this.merge(this.options, options);
    };

    this.merge = function(a, b) {
      var i;

      if (b) {
        for (i in b) {
          a[i] = b[i];
        }
      }

      return a;
    };

    this.init = function(element, options) {
      if (typeof element === 'object') {
        if (element.nodeName) {
          this.setElement(element);
          this.setOptions(options);
          this.addEvents();
        } else {
          this.setOptions(options);
        }
      } else {
        this.error('Sortboard requires an HTML element.');
      }
    };

    this.setElement = function(element) {
      this.element = element;
    };

    this.sort = function() {
      var item, gutter, itemList,
        i = 0,
        n = 0,
        w = 0,
        h = 0,
        sw = 0,
        tw = 0,
        th = 0,
        rtw = 0,
        cth = 0,
        ctw = 0;

      sw = this.element.parentElement.offsetWidth;
      gutter = this.options.gutter;
      itemList = this.getElements(this.options.itemsMatchName);
      this.size = itemList.length;
      var regx = new RegExp('(' + this.options.hiddenClass.replace('.', '') + ')+', 'i');

      for (i = 0; i < this.size; ++i) {
        item = itemList[i];

        if (!item.className.match(regx)) {
          w = item.offsetWidth;
          h = item.offsetHeight;

          if (tw >= (sw - h - gutter)) {
            tw = 0;
            th += h + gutter;

            if (!ctw) {
              ctw = n * w + ((n * gutter) - gutter);
            }
          } else {
            tw += n ? gutter : 0;
          }

          tw += w;
          rtw = tw - w;
          cth = th + h;
          n++;

          item.setAttribute('data-cords', rtw + ',' + th);
          this.translate(item, rtw + ',' + th, false);
        }
      }

      this.element.style.width = (ctw ? ctw : (n * w) + (((n < 2 ? n : n - 1)) * gutter)).toString() + 'px';
      this.element.style.height = cth.toString() + 'px';

      if (this.options.sortComplete && typeof this.options.sortComplete === 'function') {
        this.options.sortComplete();
      }
    };

    this.filterBy = function(filter) {
      if (this.currentFilter !== filter) {
        var i, attr, match, cords, regx, item, itemList, matches = [];

        regx = new RegExp(filter, 'i');
        itemList = this.getElements(this.options.itemsMatchName);

        for (i = 0; i < this.size; ++i) {
          item = itemList[i];
          attr = item.getAttribute('data-filter');

          if (attr && attr.search(regx) !== -1) {
            matches.push(item);
          }
        }

        if (!matches.length && filter !== 'all') {
          return;
        }

        this.currentFilter = filter;
        this.found = [];
        this.notfound = [];

        for (i = 0; i < this.size; ++i) {
          item = itemList[i];
          cords = item.getAttribute('data-cords');

          if (filter === 'all') {
            this.found.push(item);
            this.translate(item, cords, false);
          } else {
            attr = item.getAttribute('data-filter');
            match = (attr && attr.search(regx) !== -1);

            if (match) {
              this.found.push(item);
            } else {
              this.notfound.push(item);
            }

            this.translate(item, cords, !match);
          }
        }

        if (this.options.filterComplete && typeof this.options.filterComplete === 'function') {
          this.options.filterComplete({
            found: this.found || [],
            notfound: this.notfound || []
          });
        }

        this.sort();
      }
    };

    this.translate = function(item, cords, hide) {
      var matrix = 'matrix(1,0,0,1,' + cords + ') scale(' + (hide ? '0.001' : '1') + ')';
      item.className = hide ? this.options.hiddenClass.replace('.', '') : '';
      item.style.setProperty('opacity', hide ? '0' : '1');
      item.style.setProperty('-webkit-transform', matrix);
      item.style.setProperty('-moz-transform', matrix);
      item.style.setProperty('transform', matrix);
    };

    this.getElements = function(childrenName) {
      if (!this.elements.length) {
        this.elements = childrenName.match(/^\.(.+)$/) ? this.element.getElementsByClassName(childrenName) : this.element.getElementsByTagName(childrenName);
      }

      return this.elements;
    };

    this.error = function(str) {
      if (window.console) {
        window.console.error(str);
      }
    };

    this.init(element, options);
  };

  this.Sortboard = function(element, options) {
    var sb = new Sortboard(element, options);

    return {
      filterBy: function(filter) {
        sb.filterBy(filter);
      },
      sort: function() {
        sb.sort();
      },
      getFilter: function() {
        return sb.currentFilter;
      },
      getItems: function() {
        return sb.elements;
      },
      getFoundItems: function() {
        return sb.found;
      },
      getNotFoundItems: function() {
        return sb.notfound;
      }
    };
  };
}).call(this);
