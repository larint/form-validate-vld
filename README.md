# Form-valdiate-vld

Plugin validate form data using jquery. 

## How to use?

* add this script after jquery tag,

```
<script id="vld" type="text/javascript" src="dist/form.submit.vld.min.js"></script>
$(document).ready(function () {
    $('#form').submitVld({
        rules: {
            email: 'required|email|match',
            password: 'required|min:3',
            age: 'required',
            message: 'required|text',
            image: 'required|image|between:100,200',
            file: 'required|mime_type:csv,png|between:10,300',
            gender: 'required',
            weight: 'required|min:2|max:15',
            phone: 'required|tel:10,15',
            url: 'url',
            quanlity: 'between:10,30',
            address: 'required|regex:^[a-z0-9\,\. ]+$',
            remember_me: 'required',
            bio: 'array_required',
        },
        messages: {
            email: {
                required: ':attribute cannot empty.',
                email: ':attribute not valid.'
            },
            password: {
                required: 'Password cannot empty.'
            },
            age: {
                required: 'Age is required.'
            },
            image: {
                required: 'Image is required.',
            },
            file: {
                between: 'File size must be between :min and :max kilobytes.',
            },
            gender: {
                required: 'Gender is required.'
            },
            weight: {
                min: 'Weight must be at least :min.'
            },
            remember_me: {
                required: 'Remember me is required.'
            },
            bio: {
                array_required: 'Array checkbox is required.'
            },
        },
        attributes: {
            email: 'Email',
            password: 'Password',
            message: 'Message',
        }
    }, {
        lang: 'en',
        // showerror: 'border'
    });
});
```

* Customize input validation method using callback function.

```
bio: function() {
    if ($('#optionsRadiosBio1').is(":checked")) {
        return true;
    }
    return false;
},
```

* you can specify the vietnamese, jappanese, english language for the plugin, default is english
* display error: showerror: 'border' or 'text'. default is text
* jump to the error location: jumperror: true or false. default is false

```
$(document).ready(function() {
    $('#form').submitVld({
        rules: {
            ....
        },
        messages: {
            ....
        },
        attributes: {
            ...
        }
    },{
        lang: 'en',
        showerror: 'text',
        jumperror : false,
        clserror: 'error',
        levelerror: {
            weight: 2,
            password: 1
        }
    });
});
```

* show error class location on tag html by the way set showerror: 'any class name', along with setting levelerror: { }

```
{
    showerror: 'any-class',
    levelerror: {
        weight: 2, // parent tag level
        password: 1 // parent tag level
    }
}
```

* the example shows the 2nd level error class "dl-error" of the [weight] input.

```
{
    lang: 'en',
    showerror: 'dl-error',
    levelerror: {
        weight: 2,
        password: 1
    }
}
```

* The plugin will load the corresponding language json files in the "lang" directory.
* Can ignore the parameters "messages" and "attributes" the plugin will automatically get the default values.
* Can add other language json files to the lang directory, and only specify the language when passing into the plugin.
```
$(document).ready(function() {
    $('#form').submitVld({
        rules: {
            email: 'required|email',
            password: 'required|min:3',
            age: 'required',
            message: 'required|string',
            image: 'required|image|between:100,200',
            gender: 'required',
            weight: 'required|min:2|max:15',
            phone: 'required|tel:10,15',
            url: 'url',
            quanlity: 'between:10,30',
            address: 'regex:^[a-z0-9\,\. ]+$'
        },
    });
});
```

* You can add the class name of the html tag showing the error.

```
$(document).ready(function() {
    $('#form').submitVld({
        rules: {
            email: 'required|email',
            password: 'required|min:3',
            age: 'required',
            message: 'required|string',
            image: 'required|image|between:100,200',
            gender: 'required',
            weight: 'required|min:2|max:15',
            phone: 'required|tel:10,15',
            url: 'url',
            quanlity: 'between:10,30',
            address: 'regex:^[a-z0-9\,\. ]+$'
        },
    }, {
        clserror: 'name_of_class'
    },);
});
```

* If you don't want the plugin to check validate form, add an input tag named "novalidate" into the form tag.

```
<input type="hidden" name="novalidate">
```

* Customize the setting to jump to the error location, add attributes for tags data-jp="name tag input", or set id="jpxxx", class="jpxxx", xxx is the name of the input tag.
* ex: id="jpemail" or class="jpemail" or data-jp="email"

```
<div class="form-group">
    <label for="email" id="jpemail" class="jpemail" data-jp="email">Email address</label>
    <input type="text" class="form-control" name="email">
</div>
```

* The error tag will look like below.

![demo](https://github.com/larint/form-validate-vld/blob/master/form/image/tag_error.png)

![demo](https://github.com/larint/form-validate-vld/blob/master/form/image/vld.png)

## Authors

* **Quang Dung**

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
