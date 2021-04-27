(function($) {
    let defValidMsg = {};
    let styleError = {
        'color': 'red',
        'margin-top': '8px',
    };

    $.fn.extend({
        submitVld: function(options, formats = {}) {
            loadLang(formats);

            let form = $(this),
                fields = form.find(':input:not(button)'),
                action = form.attr('action'),
                classErr = ('clserror' in formats) ? formats.clserror : '';

            form.submit((e) => {
                $(`.err-vld`).remove();
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

                            field = (methodValidate == 'array_required') ? $('input[name="'+nameField+'[]"]') : field;

                            let valid = validator[methodValidate](field, rule, nameField, options.messages, options.attributes);

                            if (valid.hasError && errors.length == 0)
                                errors.push(valid.errorMsg);

                        })

                        if (errors.length > 0) submit = false;

                        $.each(errors, (index, error) => {
                            if (classErr != '') {
                                styleError = {}
                            }
                            var input = field.last();
                            if (field.length > 1 && input.is(':radio')) {
                                input.parent().after($(`<div class="${classErr} err-vld">${error}</div>`).css(styleError));
                            } else if (input.is(':checkbox')){
                                input.parent().after($(`<div class="${classErr} err-vld">${error}</div>`).css(styleError));
                            } else {
                                input.after($(`<div class="${classErr} err-vld">${error}</div>`).css(styleError));
                            }

                        })
                    }
                });

                return submit;
            });
        }
    });

    function Validator() {
        this.required = function(field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
                errorMsg = getErrorMsg(nameField, messages, attributes, 'required'),
                type = field.attr('type');

            if (type == 'radio') {
                let checked = false;
                field.each(function(i, obj) {
                    if ($(obj).is(':checked')) {
                        checked = true;
                    }
                });
                fieldVal = !checked ? '' : fieldVal;
            } else if(type == 'checkbox') {
                fieldVal = !field.is(':checked') ? '' : fieldVal;
            }

            return {
                hasError: (fieldVal == ''),
                errorMsg: errorMsg
            };
        };

        this.array_required = function(field, rule, nameField, messages, attributes) {
            field = $('input[name="'+nameField+'[]"]');
            let fieldVal = field.last().val(),
                errorMsg = getErrorMsg(nameField, messages, attributes, 'required'),
                type = field.attr('type');

            if (type == 'checkbox') {
                let checked = false;
                field.each(function(i, obj) {
                    if ($(obj).is(':checked')) {
                        checked = true;
                    }
                });
                fieldVal = !checked ? '' : fieldVal;
            }

            return {
                hasError: (fieldVal == ''),
                errorMsg: errorMsg
            };
        };

        this.min = function(field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
                type = field.attr('type'),
                min = rule.match(/\d+/g);
            min = min[0];
            let errorMsg = getErrorMsg(nameField, messages, attributes, 'min', defValidMsg['min'][type]);
            errorMsg = errorMsg.replace(':min', min);

            if (type == 'number') {
                return {
                    hasError: parseInt(fieldVal) < min,
                    errorMsg: errorMsg
                };
            } else if (type == 'file') {
                let file = field[0].files[0],
                    size = file != null ? Math.round(file.size / 1024 * 100) / 100 : min;
                return {
                    hasError: size < min,
                    errorMsg: errorMsg
                };
            }

            return {
                hasError: fieldVal.length < min,
                errorMsg: errorMsg
            };
        };

        this.numeric = function(field, rule, nameField, messages, attributes) {

        };

        this.max = function(field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
                type = field.attr('type'),
                max = rule.match(/\d+/g);
            max = max[0];
            let errorMsg = getErrorMsg(nameField, messages, attributes, 'max', defValidMsg['max'][type]);
            errorMsg = errorMsg.replace(':max', max);

            if (type == 'number') {
                return {
                    hasError: parseInt(fieldVal) > max,
                    errorMsg: errorMsg
                };
            } else if (type == 'file') {
                let file = field[0].files[0],
                    size = file != null ? Math.round(file.size / 1024 * 100) / 100 : 0;
                return {
                    hasError: size > max,
                    errorMsg: errorMsg
                };
            }

            return {
                hasError: fieldVal.length > max[0],
                errorMsg: errorMsg
            };
        };

        this.katakana = function(field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
                pattern = /^[\u30A0-\u30FF]+$/,
                errorMsg = existRule(messages, [nameField, 'katakana']) ? messages[nameField]['katakana'] : defValidMsg['katakana'];
            errorMsg = (nameField in attributes) ? errorMsg.replace(':attribute', attributes[nameField]) : errorMsg;
            return {
                hasError: !pattern.exec(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.tel = function(field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
                between = rule.match(/\d+/g),
                pattern = /^[\d\-]+$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'tel');
            min = between[0];
            max = between[1];
            errorMsg = errorMsg.replace(':min', min).replace(':max', max);

            return {
                hasError: !pattern.test(fieldVal) || fieldVal.length < min || fieldVal.length > max,
                errorMsg: errorMsg
            };
        };

        this.url = function(field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
                pattern = /^(https?\:\/\/)?[a-z\d\-]+[\.a-z]+$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'url');
            return {
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.alpha = function(field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
                pattern = /^[a-zA-Z]+$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'alpha');
            return {
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.alpha_dash = function(field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
                pattern = /^[a-zA-Z0-9\-]+$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'alpha_dash');
            return {
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.alpha_num = function(field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
                pattern = /^[a-zA-Z0-9]+$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'alpha_num');
            return {
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.between = function(field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
                type = field.attr('type'),
                between = rule.match(/\d+/g);
            min = between[0];
            max = between[1];
            let errorMsg = getErrorMsg(nameField, messages, attributes, 'between', defValidMsg['between'][type]);
            errorMsg = errorMsg.replace(':min', min).replace(':max', max);

            if (type == 'number') {
                return {
                    hasError: parseInt(fieldVal) < min || parseInt(fieldVal) > max,
                    errorMsg: errorMsg
                };
            } else if (type == 'file') {
                let file = field[0].files[0],
                    size = file != null ? Math.round(file.size / 1024 * 100) / 100 : (min + max) / 2;
                return {
                    hasError: size < min || size > max,
                    errorMsg: errorMsg
                };
            }

            return {
                hasError: fieldVal.length < min || fieldVal.length > max,
                errorMsg: errorMsg
            };
        };

        this.email = function(field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
                pattern = /^[a-zA-Z0-9\-\.]+@[a-z]+[\.a-z]+$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'email');
            return {
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.match = function(field, rule, nameField, messages, attributes) {
            let nameFieldMatch = 'match_'+nameField;
            let fieldVal = field.val(),
                errorMsg = getErrorMsg(nameField, messages, attributes, 'match');
            errorMsg = errorMsg.replace(':other', nameField);

            let match_value = $('input[name='+nameFieldMatch+']').val();

            return {
                hasError: !(match_value.trim() == fieldVal),
                errorMsg: errorMsg
            };
        };

        this.image = function(field, rule, nameField, messages, attributes) {
            let errorMsg = getErrorMsg(nameField, messages, attributes, 'image');
            let file = field[0].files[0],
                type = file != null ? file.type : '',
                typeImage = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/x-icon', 'image/svg+xml'];
            return {
                hasError: $.inArray(type, typeImage) == -1,
                errorMsg: errorMsg
            };
        };

        this.regex = function(field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
                pattern = rule.substr(rule.indexOf(':') + 1, rule.length),
                errorMsg = getErrorMsg(nameField, messages, attributes, 'regex');
            pattern = new RegExp(pattern);
            return {
                hasError: !pattern.test(fieldVal),
                errorMsg: errorMsg
            };
        };

        this.string = function(field, rule, nameField, messages, attributes) {
            let fieldVal = field.val(),
                pattern = /^[a-zA-Z0-9\s\.\-\,]+$/,
                errorMsg = getErrorMsg(nameField, messages, attributes, 'string');

            return {
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