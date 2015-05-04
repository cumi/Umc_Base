/**
 * Umc_Base extension
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the MIT License
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/mit-license.php
 *
 * @category  Umc
 * @package   Umc_Base
 * @copyright 2015 Marius Strajeru
 * @license   http://opensource.org/licenses/mit-license.php MIT License
 * @author    Marius Strajeru <ultimate.module.creator@gmail.com>
 */
define([
    'jquery',
    'mage/template',
    'jquery/ui',
    'jquery/jstree/jquery.jstree',
    'useDefault',
    'mage/translate',
    'mage/backend/form',
    'mage/backend/validation'
], function($, mageTemplate) {
    'use strict';
    $.mage.validation.prototype._onSuccess = function(response) {
        if (!response.error) {
            this._submit();
        } else {
            this._showErrors(response);
            var body = $('body');
            if (response.message) {
                if ($('#messages').length == 0) {
                    $('#page\\:main-container').before('<div id="messages"></div>');
                }
                var glue = (typeof response.glue != "undefined") ? response.glue : '####';
                var messages = response.message.split(glue);
                for (var i = 0; i < messages.length; i++) {
                    body.notification('add', {
                        error:'error',
                        message:messages[i]
                    });
                }
            }
            body.trigger('processStop');
        }
    };
    $.widget("umc_base.umctooltip", {
        /**
         * widget options
         */
        options: {
            autoOpen:false,
            buttonLabel: $.mage.__('OK! I got it!')
        },
        /**
         * constructor
         */
        _create: function() {
            var that = this;
            this._dialog = this.element.dialog({
                autoOpen: that.options.autoOpen,
                modal: true,
                buttons: that.getButtons(),
                width: 500
            });
        },
        /**
         * get the tooltip buttons
         */
        getButtons: function() {
            if (!this.buttons) {
                this.buttons = {};
                this.buttons[this.options.buttonLabel] = function() {
                    $(this).dialog("close");
                }
            }
            return this.buttons;
        }
    });
    $.widget("umc_base.umcmodule", $.mage.form, {
        menuDialog: '',
        entityIndex: 0,
        entities: [],
        options: {
            addAttributeTrigger:        '.add-attribute',
            addEntityTrigger:           '.add-entity',
            attributeContainer:         '.attributes-container:first',
            attributeDepends:           {},
            attributeLabelSelector:     '.attribute-label',
            attributePositionSelector:  'input.attribute-position',
            attributeReloaderSelector:  '.attribute-reloader',
            attributeSelector:          '.umc-attribute',
            attributeSortHandle:        '.fieldset-wrapper-title strong span',
            attributeSortPlaceholder:   'umc-sort-placehoder',
            attributeTemplate:          '#attribute-template',
            attributeTitleSelector:     '.attribute-title',
            entityNameSelector:         '.label-singular',
            entityContainer:             '#entities_container',
            entityDepends:              {},
            entityReloaderSelector:     '.entity-reloader',
            entitySelector:              '.umc-entity',
            entityTemplate:             '#entity-template',
            entityTitleSelector:        '.entity-title',
            entityTabIndex:             2,
            menuElementSelector:        '#umc-nav',
            menuSelector:               '#menu-selector',
            menuSelectorTrigger :       '.menu-selector-trigger',
            nameAttributes:             {},
            removeEntityMessage:        $.mage.__('Are you sure you want to remove this entity?'),
            removeEntityTrigger:        '.remove-entity',
            tabsSelector                :'#umc_base_module_tabs',
            tooltipSelector:            '.umc-tooltip',
            treeMenuItemSelector:       'li.umc-menu-selector'

        },
        _create: function() {
            var that = this;
            $(this.options.tooltipSelector).umctooltip();
            this.makeTree();
            this.menuDialog = $(this.options.menuSelector).dialog({
                autoOpen:   false,
                modal:      true,
                width:      600,
                height:     500,
                title:      $.mage.__('Select parent menu and position')
            });
            $(this.options.menuSelectorTrigger).on('click', function(e) {
                e.preventDefault();
                that.menuDialog.dialog('open');
            });
            $(this.options.addEntityTrigger).on('click', function() {
                that.addEntity();
            });
            $(this.options.entityContainer).find(this.options.entitySelector).each(function() {
                that.registerEntity(this, true);
            });
            this._super();
            this.cssFix(this.element);
        },
        cssFix: function(element){
            $(element).find('input.odd, select.odd, textarea.odd').closest('.field').addClass('odd');
        },
        makeTree: function() {
            var that = this;
            var tree = $(this.options.menuElementSelector).parent().jstree();
            tree.on('select_node.jstree', function(node, selected){
                var sel = $(selected.args[0]);
                var values = sel.attr('id').split('___');
                $('.menu-parent-id:first').val(values[0]);

                var sortOrder = '';
                var next = $(sel).parent().next().next();
                if (next.length) {
                    var nextValues = $(next).find('a:first').attr('id').split('___');
                    sortOrder = Math.ceil((parseInt(values[1]) + parseInt(nextValues[1]))/2);
                } else {
                    sortOrder = parseInt(values[1]) + 10;
                }
                $('.menu-sort-order:first').val(sortOrder);
                that.menuDialog.dialog('close');
            });
        },
        addEntity: function() {
            var that = this;
            $(this.options.entityContainer).append(mageTemplate(this.options.entityTemplate)({entity_id:this.entityIndex}));
            var newEntityContainer = $('#entity-container-' + this.entityIndex);
            this.cssFix(newEntityContainer);
            this.registerEntity(newEntityContainer, false);
            $(this.options.tabsSelector).tabs("option", "active", this.options.entityTabIndex);
            $('html, body').animate({
                scrollTop: newEntityContainer.offset().top
            }, 1000);
        },
        registerEntity: function(element, collapse) {
            var entity = $(element).umcentity({
                addAttributeTrigger:        this.options.addAttributeTrigger,
                attributeContainer:         this.options.attributeContainer,
                attributeDepends:           this.options.attributeDepends,
                attributeLabelSelector:     this.options.attributeLabelSelector,
                attributePositionSelector:  this.options.attributePositionSelector,
                attributeReloaderSelector:  this.options.attributeReloaderSelector,
                attributeSelector:          this.options.attributeSelector,
                attributeSortHandle:        this.options.attributeSortHandle,
                attributeSortPlaceholder:   this.options.attributeSortPlaceholder,
                attributeTemplate:          this.options.attributeTemplate,
                attributeTitleSelector:     this.options.attributeTitleSelector,
                entityDepends:              this.options.entityDepends,
                entityNameSelector:         this.options.entityNameSelector,
                entityTitleSelector:        this.options.entityTitleSelector,
                index:                      this.entityIndex,
                module:                     this,
                reloaderSelector:           this.options.entityReloaderSelector,
                nameAttribute:              this.options.nameAttributes[this.entityIndex],
                removeEntityMessage:        this.options.removeEntityMessage,
                removeEntityTrigger:        this.options.removeEntityTrigger
            });
            this.entities.push(entity);
            this.entityIndex++;
            if (collapse) {
                $(element).find('.fieldset-wrapper-content.collapse').collapse('hide');
            }
        },
        removeEntity: function(index) {
            for (var i = 0; i < this.entities.length; i++) {
                if (this.entities[i].umcentity('getIndex') == index) {
                    this.entities[i].umcentity('destroy');
                    this.entities.splice(i, 1);
                }
            }
            return this;
        }
    });
    $.widget("umc_base.umcentity", {
        index: '',
        module: '',
        attributeIndex: 0,
        attributes: [],
        options: {
            addAttributeTrigger:        '.add-attribute',
            attributeContainer:         '.attributes-container:first',
            attributeDepends:           {},
            attributeLabelSelector:     '.attribute-label',
            attributePositionSelector:  'input.attribute-position',
            attributeReloaderSelector:  '.attribute-reloader',
            attributeSelector:          '.umc-attribute',
            attributeSortHandle:        '.fieldset-wrapper-title',
            attributeSortPlaceholder:   'umc-sort-placehoder',
            attributeTemplate:          '#attribute-template',
            attributeTitleSelector:     '.fieldset-wrapper-title strong span',
            entityDepends:              {},
            entityNameSelector:         '.label-singular',
            entityTitleSelector:        '.entity-title',
            index:                      '',
            module:                     '',
            nameAttribute:              '',
            reloaderSelector:           '.entity-reloader',
            removeEntityMessage:        $.mage.__('Are you sure you want to remove this entity?'),
            removeEntityTrigger:        '.remove-entity'
        },
        _create: function() {
            var that = this;
            this.index = this.options.index;
            this.module = this.options.module;
            $(this.element).find(this.options.entityNameSelector).on('change', function() {
                var val = 'Entity ' + that.getIndex();
                if ($(this).val()) {
                    val = $(this).val();
                }
                $(that.element).find(that.options.entityTitleSelector).html(val);
            });
            $(this.element).find(this.options.removeEntityTrigger).on('click', function() {
                if (confirm(that.options.removeEntityMessage)) {
                    that.remove();
                }
            });
            $(this.element).find(this.options.addAttributeTrigger).on('click', function() {
                that.addAttribute();
            });
            $(this.element).find(this.options.attributeContainer).find(this.options.attributeSelector).each(function() {
                that.registerAttribute(this);
            });
            this.initAttributesSort(false);
            $(this.element).find(this.options.reloaderSelector).on('change', function() {
                that.checkElements();
                for (var i = 0; i<that.attributes.length; i++) {
                    $(that.attributes[i]).umcattribute('checkElements');
                }
            });
            this.checkElements();
        },
        setIndex: function(index) {
           this.index = index;
        },
        getIndex: function() {
            return this.index;
        },
        setModule: function(module) {
            this.module = module;
        },
        remove: function() {
            var that = this;
            this.module.removeEntity(this.index);
            $(this.element).slideUp(500, function() {
                $(that.element).remove();
            });
        },
        addAttribute: function() {
            var vars = {
                entity_id:this.getIndex(),
                attribute_id: this.attributeIndex
            };
            $(this.getAttributesContainer()).append(mageTemplate(this.options.attributeTemplate)(vars));
            var newAttributeContainer = $('#attribute_' + this.getIndex() + '_' + this.attributeIndex);
            this.module.cssFix(newAttributeContainer);
            this.registerAttribute(newAttributeContainer);
            this.initAttributesSort(true);
            $(this.getAttributesContainer().parent()).collapse('show');
            $('html, body').animate({
                scrollTop: newAttributeContainer.offset().top - 100
            }, 1000);
        },
        registerAttribute: function(element) {
            var attribute = $(element).umcattribute({
                attributeDepends: this.options.attributeDepends,
                entity: this,
                index: this.attributeIndex,
                labelSelector: this.options.attributeLabelSelector,
                reloaderSelector: this.options.attributeReloaderSelector,
                titleSelector: this.options.attributeTitleSelector,
                tooltipSelector: this.options.tooltipSelector
            });
            if (this.attributeIndex == this.options.nameAttribute) {
                attribute.umcattribute('getNameElement').attr('checked', 'checked');
            }
            this.attributes.push(attribute);
            this.attributeIndex++;
        },
        removeAttribute: function(index) {
            for (var i = 0; i < this.attributes.length; i++) {
                if (this.attributes[i].umcattribute('getIndex') == index) {
                    this.attributes[i].umcattribute('destroy');
                    this.attributes.splice(i, 1);
                }
            }
            return this;
        },
        initAttributesSort: function(withDestroy) {
            var that = this;
            if (withDestroy) {
                this.getAttributesContainer().sortable('destroy');
            }
            this.getAttributesContainer().sortable({
                handle: this.options.attributeSortHandle,
                items: this.options.attributeSelector,
                placeholder: this.options.attributeSortPlaceholder,
                update: function() {
                    that.updatePosition();
                }
            });
            return this;
        },
        getAttributesContainer: function() {
            return $(this.element).find(this.options.attributeContainer);
        },
        updatePosition : function() {
            $(this.element).find(this.options.attributePositionSelector).each(function(item) {
                $(this).attr('value', 10 * (item + 1));
            });
        },
        checkElements: function() {
            for (var id in this.options.entityDepends) {
                var depends = this.options.entityDepends[id];
                var valid = false;
                for (var j = 0; j < depends.length; j++) {
                    var groupValid = true;
                    for (var k in depends[j]) {
                        var parentElem = $(this.element).find('#entity_' + this.getIndex() + '_' + k);
                        var value = $(parentElem).val();
                        if (typeof depends[j][k]['entity'] != "undefined") {
                            if ($.inArray(value, depends[j][k]['entity']) == -1) {
                                groupValid = false;
                                break;
                            }
                        }
                    }
                    if (groupValid) {
                        valid = true;
                        break;
                    }
                }
                var mainElement = $(this.element).find('#entity_' + this.getIndex() + '_' + id);
                valid ? this.enableElement(mainElement) : this.disableElement(mainElement);
            }

        },
        disableElement: function(elem) {
            $(elem).attr('disabled', 'disabled');
        },
        enableElement: function(elem) {
            $(elem).removeAttr('disabled');
        },
        getElement: function() {
            return this.element;
        }



    });
    $.widget("umc_base.umcattribute", {
        entity: '',
        index: '',
        options: {
            attributeDepends: {},
            entity: '',
            index: '',
            labelSelector: '.attribute-label',
            reloaderSelector: '.attribute-reloader',
            titleSelector: '.attribute-title'
        },
        _create: function() {
            var that = this;
            this.entity = this.options.entity;
            this.index = this.options.index;
            this.processIsName();
            $(this.element).find(this.options.labelSelector).on('change', function() {
                var val = 'Attribute ' + that.getIndex();
                if ($(this).val()) {
                    val = $(this).val();
                }
                $(that.element).find(that.options.titleSelector).html(val);
            });
            $(this.element).find(this.options.labelSelector).change();

            $(this.element).find('button.delete').on('click', function() {
                if (confirm($.mage.__('Are you sure you want to remove this attribute?'))) {
                    that.remove();
                }
            });
            $(this.element).find(this.options.reloaderSelector).on('change', function() {
                that.checkElements();
            });
            this.checkElements();

        },
        setIndex: function(index) {
            this.index = index;
            this.processIsName();
        },
        getIndex: function() {
            return this.index;
        },
        setEntity: function(entity) {
            this.entity = entity;
        },
        getEntity: function() {
            return this.entity;
        },
        getNameElement: function() {
            return $(this.element).find('.is-name:first');
        },
        processIsName: function() {
            this.getNameElement().attr('name', 'entity[' + this.getEntity().getIndex() + '][attributes][is_name]');
            this.getNameElement().attr('value', this.getIndex());
        },
        remove: function() {
            var that = this;
            $(this.element).slideUp(500, function() {
                $(that.element).remove();
            });
            this.getEntity().removeAttribute(this.index);
        },
        checkElements: function() {
            for (var id in this.options.attributeDepends) {
                var depends = this.options.attributeDepends[id];
                var valid = false;
                for (var j = 0; j < depends.length; j++) {
                    var groupValid = true;
                    for (var k in depends[j]) {
                        var parentElem = '';
                        var arrValues = '';
                        if (typeof depends[j][k]['attribute'] != "undefined") {
                            parentElem = $(this.element).find('#attribute_' + this.getEntity().getIndex() + '_' + this.getIndex() + '_' + k);
                            arrValues = depends[j][k]['attribute'];
                        } else {
                            parentElem = $(this.getEntity().getElement()).find('#entity_' + this.getEntity().getIndex() +  '_' + k);
                            arrValues = depends[j][k]['entity'];
                        }
                        var value = $(parentElem).val();
                        if ($.inArray(value, arrValues) == -1) {
                            groupValid = false;
                            break;
                        }
                    }
                    if (groupValid) {
                        valid = true;
                        break;
                    }
                }
                var mainElement = $(this.element).find('#attribute_' + this.getEntity().getIndex() + '_' + this.getIndex() + '_' + id);
                valid ? this.enableElement(mainElement) : this.disableElement(mainElement);
            }

        },
        disableElement: function(elem) {
            this.getEntity().disableElement(elem);
        },
        enableElement: function(elem) {
            this.getEntity().enableElement(elem);
        }

    });
});
