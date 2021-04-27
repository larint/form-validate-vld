# SubmitVLD

Plugin validate form data using jquery. This is not a full version.
Plugin dùng để validate form sử dụng jquery. Đây chưa phải bản đầy đủ do còn thiếu một số hàm validate
.
## How to use?
## English and Vietnam instructions:

add this script after jquery:
Thêm thẻ script vào head, lưu ý thêm sau thẻ jquery:
[<script id="vld" type="text/javascript" src="dist/form.submit.vld.min.js"></script>](dist/form.submit.vld.min.js)

Update: add callback for validate.

Use as below:
Sử dụng như sau:

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
using call back for input for example:
```
bio: function() {
    if ($('#optionsRadiosBio1').is(":checked")) {
        return true;
    }
    alert('Bio not choose!');
    return false;
},
```
If no language is specified, the plugin will use English to display the error.
Nếu không chỉ định ngôn ngữ cho plugin, thì sẽ tự động lấy ngôn ngữ mặc định là tiếng anh.
For exmaple: you can specify the vietnamese language for the plugin as follows:
Ví dụ: chỉ định ngôn ngữ tiếng việt như bên dưới:

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

The plugin will load the corresponding language json files in the "lang" directory.
Plugin sẽ tự động load file ngôn ngữ trong thư mục lang tương ứng với tham số lang truyền vào plugin.
You can ignore the parameters "messages" and "attributes" the plugin will automatically get the default values.
Bạn có thể bỏ qua các tham số "mesages" và "attributes" của plugin, plugin sẽ lấy các gía trị mặc định để sử dụng.
You can add other language json files to the lang directory, and only specify the language when passing into the plugin.
Bạn có thể thêm các file json ngôn ngữ khác vào thư mục lang, và chỉ địn tên ngôn ngữ khi truyền vào plugin.

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

You can add the class name of the html tag showing the error.
Bạn có thể chỉ định tên class của thẻ html hiển thị lỗi. Từ tên class này bạn có thể css lại cho phù hợp.

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
The error tag will look like below.
Thẻ tag hiển thị lỗi sẽ như bên dưới.
![demo](https://github.com/quangdung285/SubmitVLD/blob/master/form/image/tag_error.png)

![demo](https://github.com/quangdung285/SubmitVLD/blob/master/form/image/vld.png)

## Authors

* **QD**

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
