# Form-valdiate-vld

Plugin validate form data using jquery. 

## How to use?

* add this script after jquery tag
```
<script id="vld" type="text/javascript" src="dist/form.submit.vld.min.js"></script>
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
            address: 'regex:^[a-z0-9\,\. ]+$',
            remember_me: 'required',
            bio: 'array_required',
        },
        messages: {
            email: { required: ':attribute cannot empty.' },
            password: {
                required: 'Password cannot empty.',
            },
            age: { required: 'Age is required.' },
            image: {
                required: 'Image is required.',
            },
            gender: { required: 'Gender is required.' },
            weight: { min: 'Weight must be at least :min.' },
            remember_me: { required: 'Remember me is required.' },
            bio: { array_required: 'Array checkbox is required.' },
        },
        attributes: {
            email: 'Email',
            password: 'Password',
            message: 'Message',
        }
    });
});
```
* using call back for input for example:
```
bio: function() {
    if ($('#optionsRadiosBio1').is(":checked")) {
        return true;
    }
    alert('Bio not choose!');
    return false;
},
```
* If no language is specified, the plugin will use English to display the error.
* For exmaple: you can specify the vietnamese language for the plugin as follows:
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
        lang: 'vi'
    });
});
```

* The plugin will load the corresponding language json files in the "lang" directory.
* You can ignore the parameters "messages" and "attributes" the plugin will automatically get the default values.
* You can add other language json files to the lang directory, and only specify the language when passing into the plugin.
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

* The error tag will look like below.

![demo](https://github.com/larint/form-validate-vld/blob/master/form/image/tag_error.png)

![demo](https://github.com/larint/form-validate-vld/blob/master/form/image/vld.png)

## Authors

* **Quang Dung**

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
