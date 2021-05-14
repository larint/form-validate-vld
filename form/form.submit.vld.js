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

            let form = $(this),
                fields = form.find(':input:not(button)'),
                action = form.attr('action'),
                classErr = ('clserror' in formats) ? formats.clserror : defaultClassErr,
                showErr = ('showerror' in formats) && defaultShowError.includes(formats.showerror) ? formats.showerror : defaultShowError[0],
                jumpErr = ('jump_error' in formats) && formats.jump_error == true ? true : false;

            form.submit((e) => {
                if (!isValidOptionVld(form, options)) {
                    return false
                }
                resetErrorStyle();
                let validator = new Validator();
                let params = form.serializeArray(),
                    submit = true;

                $.each(options.rules, (nameField, rules) => {
                    if (typeof rules === 'function') {
                        submit = submit && rules();
                    } else {
                        let field = form.find(`:input[name=${nameField}]`),
                            rulesArray = rules.split('|'),
                            errors = [];

                        $.each(rulesArray, (index, rule) => {
                            let methodValidate = rule,
                                optionValidate;

                            if (/\:/.test(rule)) {
                                methodValidate = rule.substr(0, rule.indexOf(':'));
                            }

                            if (validator[methodValidate]) {
                                // must be check required
                                if (rulesArray.includes('required') || rulesArray.includes('array_required')) {
                                    let valid = validator[methodValidate](field, rule, nameField, options.messages, options.attributes);

                                    if (valid.hasError && errors.length == 0) {
                                        errors.push(valid);
                                    }
                                }
                            } else {
                                alert('invalid [' + methodValidate + '] validate method, wrong method name.');
                            }
                        })

                        if (errors.length > 0) submit = false;

                        $.each(errors, (index, error) => {
                            showError(error, classErr, showErr, jumpErr)
                        })
                    }
                });

                return submit;
            });
        }
    });

    function isValidOptionVld(form, options) {
        var nameIp = [];
        form.find('input, select, textarea').each(function () {
            var name = $(this).attr('name').replace('[', '').replace(']', '');
            nameIp.push(name);
        });
        for (const key in options.rules) {
            if (!nameIp.includes(key)) {
                alert('rules parameter [' + key + '] does not match the input name.');
                return false
            }
        }
        for (const key in options.messages) {
            if (!nameIp.includes(key)) {
                alert('messages parameter [' + key + '] does not match the input name.');
                return false
            }
        }

        return true
    }

    function resetErrorStyle() {
        $('.' + defaultClassErr).remove();
        $('input').each(function () {
            var oldStyle = $(this).attr('style');
            if (oldStyle) {
                oldStyle = oldStyle.replace('border: 1px solid red;', '')
                $(this).attr('style', oldStyle);
            }
        });
    }

    function showError(error, classErr, showErr, jumpErr) {
        var input = error.input;

        if (showErr == defaultShowError[0]) {
            if (input.length > 1 && input.is(':radio')) {
                input.parent().after($(`<div class="${classErr}">${error.errorMsg}</div>`).css(styleError.text));
            } else if (input.is(':checkbox')) {
                input.parent().after($(`<div class="${classErr}">${error.errorMsg}</div>`).css(styleError.text));
            } else {
                input.after($(`<div class="${classErr} www">${error.errorMsg}</div>`).css(styleError.text));
            }
        } else if (showErr == defaultShowError[1]) {
            input.css(styleError.border);
        }

        if (jumpErr) {
            $([document.documentElement, document.body]).animate({
                scrollTop: input.offset().top
            }, 100);
        }
    }

    function isValidUrl(url) {
        var optUrl = {
            exact: true,
            strict: true
        };

        var protocol = `(?:(?:[a-z]+:)?//)${optUrl.strict ? '' : '?'}`;
        var auth = '(?:\\S+(?::\\S*)?@)?';
        var host = '(?:(?:[a-z\\u00a1-\\uffff0-9][-_]*)*[a-z\\u00a1-\\uffff0-9]+)';
        var domain = '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*';
        var port = '(?::\\d{2,5})?';
        var path = '(?:[/?#][^\\s"]*)?';
        var regex = `(?:${protocol}|www\\.)${auth}(?:localhost|${host}${domain})${port}${path}`;

        var regExp = optUrl.exact ? new RegExp(`(?:^${regex}$)`, 'i') : new RegExp(regex, 'ig');

        return regExp.test(url);
    }

    function Validator() {
        this.required = function (field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
                errorMsg = getErrorMsg(nameField, messages, attributes, 'required'),
                type = field.attr('type');
            if (type == 'radio') {
                let checked = false;
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
            let fieldVal = field.last().val(),
                errorMsg = getErrorMsg(nameField, messages, attributes, 'array_required'),
                type = field.attr('type');

            if (type == 'checkbox') {
                let checked = false;
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

        this.numeric = function (field, rule, nameField, messages, attributes) {

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
            let fieldVal = field.val(),
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
            let fieldVal = field.val(),
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
            let fieldVal = field.val(),
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
            let fieldVal = field.val(),
                pattern = /^[a-zA-Z]+$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'alpha');
            return {
                input: field,
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.alpha_dash = function (field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
                pattern = /^[a-zA-Z0-9\-]+$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'alpha_dash');
            return {
                input: field,
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.alpha_num = function (field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
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
            let fieldVal = field.val(),
                pattern = /^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]+)*$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'email');
            return {
                input: field,
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.match = function (field, rule, nameField, messages, attributes) {
            let nameFieldMatch = 'match_' + nameField;
            let fieldMatch = $('input[name=' + nameFieldMatch + ']')
            let fieldVal = field.val(),
                errorMsg = getErrorMsg(nameField, messages, attributes, 'match');
            errorMsg = errorMsg.replace(':other', nameField);

            let match_value = fieldMatch.val();
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
            let fieldVal = field.val(),
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
            let fieldVal = field.val(),
                pattern = /^[a-zA-Z0-9\s\.\-\,]+$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'text');
            return {
                input: field,
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };
    }

    function getErrorMsg(nameField, messages, attributes, rule, defaultError = '') {
        let errorMsg = existRule(messages, [nameField, rule]) ? messages[nameField][rule] : (defaultError != '') ? defaultError : defValidMsg[rule];
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
        $.getJSON(`${dir}/lang/${file}.json`, (json) => {
            defValidMsg = json;
        });
    }
})(jQuery);