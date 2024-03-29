(function ($) {
    var defValidMsg = {};
    var styleError = {
        text: {
            'color': 'red',
            'margin-top': '8px',
        },
        border: {
            border: '1px solid red'
        }
    };

    var defaultShowError = ['text', 'border'];
    var defaultClassErr = 'err-vld';

    $.fn.extend({
        submitVld: function (options, formats = {}) {
            loadLang(formats);

            var form = $(this),
                classErr = ('clserror' in formats) ? formats.clserror : defaultClassErr,
                showErr = ('showerror' in formats) && formats.showerror ? formats.showerror : defaultShowError[0],
                jumpErr = ('jumperror' in formats) && formats.jumperror == true ? true : false,
                levelErr = ('levelerror' in formats) ? formats.levelerror : {},
                liveCheck = ('liveCheck' in formats) ? formats.liveCheck : false;

            form.submit(function () {
                var novalidate = form.find(`input[name=novalidate]`).length;
                if (novalidate == 1) {
                    return true;
                }

                if (!isValidOptionVld(form, options)) {
                    return false;
                }

                resetErrorStyle(classErr);
                var validator = new Validator();
                var submit = true, jumpF = true;

                $.each(options.rules, function (nameField, rules) {
                    if (typeof rules === 'function') {
                        submit = submit && rules();
                    } else {
                        var field = form.find(`:input[name=${nameField}]`),
                            rulesArray = rules.split('|'),
                            errors = [];

                        $.each(rulesArray, function (index, rule) {
                            var methodValidate = rule;

                            if (/\:/.test(rule)) {
                                methodValidate = rule.substr(0, rule.indexOf(':'));
                            }

                            if (validator[methodValidate]) {
                                // must be check required
                                if (rulesArray.includes('required') || rulesArray.includes('array_required')) {
                                    var valid = validator[methodValidate](field, rule, nameField, options.messages, options.attributes);

                                    if (valid.hasError && errors.length == 0) {
                                        errors.push(valid);
                                    }
                                }
                            } else {
                                console.log('invalid [' + methodValidate + '] validate method, wrong method name.');
                            }
                        })

                        if (errors.length > 0) submit = false;

                        $.each(errors, function (index, error) {
                            var errClass = classErr + ' err-' + nameField;
                            showError(error, errClass, showErr, jumpErr, levelErr);
                            if (jumpF) {
                                jumpF = jumpError(form, error, jumpErr);
                            }
                        })
                    }
                });

                return submit;
            });

            if (liveCheck) {
                $.each(options.rules, function (nameField, rules) {
                    var field = form.find(`:input[name=${nameField}]`);
                    var matchField = form.find(`:input[name=match_${nameField}]`);
                    if (matchField.length > 0) {
                        matchField.blur(function () {
                            field.trigger('blur');
                        })
                    }
                    field.blur(function () {
                        var novalidate = form.find(`input[name=novalidate]`).length;
                        if (novalidate == 1) {
                            return true;
                        }

                        if (!isValidOptionVld(form, options)) {
                            return false;
                        }

                        resetErrorStyle(classErr, nameField);
                        var validator = new Validator();
                        var jumpF = true;

                        if (typeof rules === 'function') {
                            rules();
                        } else {
                            var field = form.find(`:input[name=${nameField}]`),
                                rulesArray = rules.split('|'),
                                errors = [];

                            $.each(rulesArray, function (index, rule) {
                                var methodValidate = rule;

                                if (/\:/.test(rule)) {
                                    methodValidate = rule.substr(0, rule.indexOf(':'));
                                }

                                if (validator[methodValidate]) {
                                    // must be check required
                                    if (rulesArray.includes('required') || rulesArray.includes('array_required')) {
                                        var valid = validator[methodValidate](field, rule, nameField, options.messages, options.attributes);

                                        if (valid.hasError && errors.length == 0) {
                                            errors.push(valid);
                                        }
                                    }
                                } else {
                                    console.log('invalid [' + methodValidate + '] validate method, wrong method name.');
                                }
                            })

                            $.each(errors, function (index, error) {
                                var errClass = classErr + ' err-' + nameField;
                                showError(error, errClass, showErr, jumpErr, levelErr);
                                if (jumpF) {
                                    jumpF = jumpError(form, error, jumpErr);
                                }
                            })
                        }
                    })
                });
            }
        }
    });

    function jumpError(form, error, jumpErr) {
        if (jumpErr) {
            var name = error.input.attr('name');
            var el = form.find('#jp' + name + ',' + '.jp' + name);
            el = (el.length == 0) ? form.find('*[data-jp=' + name + ']') : el;
            el = (el.length == 0) ? error.input : el;
            $([document.documentElement, document.body]).animate({
                scrollTop: el.offset().top
            }, 100);
        }
        return false;
    }

    function isValidOptionVld(form, options) {
        var nameIp = [];
        form.find('input, select, textarea').each(function () {
            var name = $(this).attr('name');
            name = name ? name.replace('[', '').replace(']', '') : '';
            nameIp.push(name);
        });
        for (const key in options.rules) {
            if (!nameIp.includes(key)) {
                console.log('rules parameter [' + key + '] does not match the input name.');
                return false
            }
        }
        for (const key in options.messages) {
            if (!nameIp.includes(key)) {
                console.log('messages parameter [' + key + '] does not match the input name.');
                return false
            }
        }

        return true
    }

    function resetErrorStyle(classErr, nameField = null) {
        if (nameField) {
            $('.err-' + nameField).remove();
        } else { // reset all
            $('.' + classErr).remove();
            $('input').each(function () {
                var oldStyle = $(this).attr('style');
                if (oldStyle) {
                    oldStyle = oldStyle.replace('border: 1px solid red;', '')
                    $(this).attr('style', oldStyle);
                }
            });
        }
    }

    function showError(error, classErr, showErr, jumpErr, levelErr) {
        var input = error.input;
        var fieldName = input.attr('name');
        fieldName = fieldName ? fieldName.replace('[', '').replace(']', '') : '';
        if (showErr == defaultShowError[0]) { // show text error
            if (input.length > 1 && input.is(':radio')) {
                if (fieldName in levelErr && levelErr[fieldName] > 0 && levelErr[fieldName] <= 4) {
                    input.parents().eq(levelErr[fieldName]).after($(`<div class="${classErr}">${error.errorMsg}</div>`).css(styleError.text));
                } else {
                    input.parent().after($(`<div class="${classErr}">${error.errorMsg}</div>`).css(styleError.text));
                }
            } else if (input.is(':checkbox')) {
                if (fieldName in levelErr && levelErr[fieldName] > 0 && levelErr[fieldName] <= 4) {
                    input.parents().eq(levelErr[fieldName]).after($(`<div class="${classErr}">${error.errorMsg}</div>`).css(styleError.text));
                } else {
                    input.parent().after($(`<div class="${classErr}">${error.errorMsg}</div>`).css(styleError.text));
                }
            } else {
                if (fieldName in levelErr && levelErr[fieldName] > 0 && levelErr[fieldName] <= 4) {
                    input.parents().eq(levelErr[fieldName] - 1).after($(`<div class="${classErr}">${error.errorMsg}</div>`).css(styleError.text));
                } else {
                    input.after($(`<div class="${classErr}">${error.errorMsg}</div>`).css(styleError.text));
                }
            }
        } else if (showErr == defaultShowError[1]) { // show border error
            input.addClass(classErr);
            if (input.attr('type') != 'file') {
                input.css(styleError.border);
            }
        } else {
            if (fieldName in levelErr && levelErr[fieldName] > 0 && levelErr[fieldName] <= 4) {
                input.parents().eq(levelErr[fieldName] - 1).addClass(showErr);
            } else {
                input.addClass(showErr);
            }
        }
    }

    function isValidUrl(url) {
        var res = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/g);
        if (res == null)
            return false;
        else
            return true;
    }

    function Validator() {
        this.required = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val(),
                errorMsg = getErrorMsg(nameField, messages, attributes, 'required'),
                type = field.attr('type');
            if (type == 'radio') {
                var checked = false;
                field.each(function (i, obj) {
                    if ($(obj).is(':checked')) {
                        checked = true;
                    }
                });
                fieldVal = !checked ? '' : fieldVal;
            } else if (type == 'checkbox') {
                fieldVal = !field.is(':checked') ? '' : fieldVal;
            }
            return {
                input: field,
                hasError: (fieldVal == ''),
                errorMsg: errorMsg
            };
        };

        this.array_required = function (field, rule, nameField, messages, attributes) {
            field = $('input[name="' + nameField + '[]"]');
            var fieldVal = field.last().val(),
                errorMsg = getErrorMsg(nameField, messages, attributes, 'array_required'),
                type = field.attr('type');

            if (type == 'checkbox') {
                var checked = false;
                field.each(function (i, obj) {
                    if ($(obj).is(':checked')) {
                        checked = true;
                    }
                });
                fieldVal = !checked ? '' : fieldVal;
            }
            return {
                input: field,
                hasError: (fieldVal == ''),
                errorMsg: errorMsg
            };
        };

        this.min = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val(),
                type = field.attr('type'),
                min = rule.match(/\d+/g);
            min = min[0];
            type = type ? type : 'text';
            var errorMsg = getErrorMsg(nameField, messages, attributes, 'min', defValidMsg.min[type]);
            errorMsg = errorMsg.replace(':min', min);

            if (type == 'number') {
                return {
                    input: field,
                    hasError: parseInt(fieldVal) < min,
                    errorMsg: errorMsg
                };
            } else if (type == 'file') {
                var file = field[0].files[0],
                    size = file != null ? Math.round(file.size / 1024 * 100) / 100 : min;
                return {
                    input: field,
                    hasError: size < min,
                    errorMsg: errorMsg
                };
            }
            return {
                input: field,
                hasError: fieldVal.length < min,
                errorMsg: errorMsg
            };
        };

        this.digit = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val(),
                pattern = /^\d$/,
                errorMsg = existRule(messages, [nameField, 'digit']) ? messages[nameField]['digit'] : defValidMsg['digit'];
            errorMsg = (nameField in attributes) ? errorMsg.replace(':attribute', attributes[nameField]) : errorMsg;
            return {
                input: field,
                hasError: !pattern.exec(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.max = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val(),
                type = field.attr('type'),
                max = rule.match(/\d+/g);
            max = max[0];
            type = type ? type : 'text';
            var errorMsg = getErrorMsg(nameField, messages, attributes, 'max', defValidMsg.max[type]);
            errorMsg = errorMsg.replace(':max', max);

            if (type == 'number') {
                return {
                    input: field,
                    hasError: parseInt(fieldVal) > max,
                    errorMsg: errorMsg
                };
            } else if (type == 'file') {
                var file = field[0].files[0],
                    size = file != null ? Math.round(file.size / 1024 * 100) / 100 : 0;
                return {
                    input: field,
                    hasError: size > max,
                    errorMsg: errorMsg
                };
            }
            return {
                input: field,
                hasError: fieldVal.length > max,
                errorMsg: errorMsg
            };
        };

        this.katakana = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val(),
                pattern = /^[\u30A0-\u30FF]+$/,
                errorMsg = existRule(messages, [nameField, 'katakana']) ? messages[nameField]['katakana'] : defValidMsg['katakana'];
            errorMsg = (nameField in attributes) ? errorMsg.replace(':attribute', attributes[nameField]) : errorMsg;
            return {
                input: field,
                hasError: !pattern.exec(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.tel = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val(),
                between = rule.match(/\d+/g),
                pattern = /^[\d\-]+$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'tel');
            min = between[0];
            max = between[1];
            errorMsg = errorMsg.replace(':min', min).replace(':max', max);
            return {
                input: field,
                hasError: !pattern.test(fieldVal) || fieldVal.length < min || fieldVal.length > max,
                errorMsg: errorMsg
            };
        };

        this.teljp = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val(),
                pattern = /^(?:\d{10}|\d{2,5}-\d{3,4}-\d{3,4})$/, //12-3456-7890, 123-4567-8901
                errorMsg = getErrorMsg(nameField, messages, attributes, 'teljp');
            return {
                input: field,
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.url = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val();
            var errorMsg = getErrorMsg(nameField, messages, attributes, 'url');
            return {
                input: field,
                hasError: !isValidUrl(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.alpha = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val(),
                pattern = /^[a-zA-Z]+$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'alpha');
            return {
                input: field,
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.alpha_dash = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val(),
                pattern = /^[a-zA-Z0-9\-]+$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'alpha_dash');
            return {
                input: field,
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.alpha_num = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val(),
                pattern = /^[a-zA-Z0-9]+$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'alpha_num');
            return {
                input: field,
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.between = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val(),
                type = field.attr('type'),
                between = rule.match(/\d+/g);
            min = between[0];
            max = between[1];
            var errorMsg = getErrorMsg(nameField, messages, attributes, 'between', defValidMsg.between[type]);
            errorMsg = errorMsg.replace(':min', min).replace(':max', max);

            if (type == 'number') {
                return {
                    input: field,
                    hasError: parseInt(fieldVal) < min || parseInt(fieldVal) > max,
                    errorMsg: errorMsg
                };
            } else if (type == 'file') {
                var file = field[0].files[0],
                    size = file != null ? Math.round(file.size / 1024 * 100) / 100 : (min + max) / 2;
                return {
                    input: field,
                    hasError: size < min || size > max,
                    errorMsg: errorMsg
                };
            }
            return {
                input: field,
                hasError: fieldVal.length < min || fieldVal.length > max,
                errorMsg: errorMsg
            };
        };

        this.email = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val(),
                pattern = /^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]+)*$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'email');
            return {
                input: field,
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.match = function (field, rule, nameField, messages, attributes) {
            var nameFieldMatch = 'match_' + nameField;
            var fieldMatch = $('input[name=' + nameFieldMatch + ']')
            var fieldVal = field.val(),
                errorMsg = getErrorMsg(nameField, messages, attributes, 'match');
            errorMsg = errorMsg.replace(':other', nameField);

            var match_value = fieldMatch.val();
            return {
                input: fieldMatch,
                hasError: !(match_value.trim() == fieldVal),
                errorMsg: errorMsg
            };
        };

        this.image = function (field, rule, nameField, messages, attributes) {
            var file = field[0].files[0],
                type = file != null ? file.type : '',
                typeImage = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/x-icon', 'image/svg+xml'];
            var errorMsg = getErrorMsg(nameField, messages, attributes, 'image');
            return {
                input: field,
                hasError: $.inArray(type, typeImage) == -1,
                errorMsg: errorMsg
            };
        };

        this.mime_type = function (field, rule, nameField, messages, attributes) {
            var file = field[0].files[0],
                mimeType = rule.split(':')[1].split(','),
                ext = file ? file.name.split('.').pop() : '';
            var errorMsg = getErrorMsg(nameField, messages, attributes, 'mime_type');
            errorMsg = errorMsg.replace(':ext', mimeType.join('|'));
            return {
                input: field,
                hasError: !mimeType.includes(ext),
                errorMsg: errorMsg
            };
        };

        this.regex = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val(),
                pattern = rule.substr(rule.indexOf(':') + 1, rule.length),
                errorMsg = getErrorMsg(nameField, messages, attributes, 'regex');
            pattern = new RegExp(pattern);
            return {
                input: field,
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.text = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val(),
                pattern = /^[a-zA-Z0-9\s\.\-\,]+$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'text');
            return {
                input: field,
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.date = function (field, rule, nameField, messages, attributes) {
            var fieldVal = field.val(),
                pattern = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'date');
            return {
                input: field,
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };
    }

    function getErrorMsg(nameField, messages, attributes, rule, defaultError = '') {
        var errorMsg = existRule(messages, [nameField, rule]) ? messages[nameField][rule] : (defaultError != '') ? defaultError : defValidMsg[rule];
        errorMsg = (attributes != undefined && nameField in attributes) ? errorMsg.replace(':attribute', attributes[nameField]) : errorMsg.replace(':attribute', nameField.toUpperCase());
        return errorMsg;
    }

    function existRule(messages, keys) {
        return (messages != undefined && keys[0] in messages && keys[1] in messages[keys[0]]);
    }

    function loadLang(formats) {
        var file = 'en';
        var dir = document.getElementById("vld").src.split('/').slice(0, -1).join('/');
        if (!$.isEmptyObject(formats) && ('lang' in formats)) {
            file = formats.lang;
        }
        $.getJSON(`${dir}/lang/${file}.json`, function (json) {
            defValidMsg = json;
        });
    }
})(jQuery);