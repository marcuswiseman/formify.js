# formify.js
Turn all forms into ajax requests. (jQuery Plugin ~ v2 - v3.3.1+)
```
<form class="formify" method="GET" data-action="filter">
    <input type="text" name="id">
    <input type="submit" value="Filter">
</form>

<form class="formify" method="GET" data-action="add_note">
    <input type="hidden" data-bind="filter.id">
    <textarea name="note"></textarea>
    <input type="submit" value="Add">
</form>
```

so when changes are made to input `id` in the first form, it updates it in the second where `data-bind="filter.id"` matches.

For server-side response (PHP for example);

```
return json_encode([
  'callback' => 'prompt',
  'arguments' => ['msg' => 'Note must be specified.']
]);
```

then specify function "do_prompt" inside the script tag of your body:
```
function do_prompt(arg) {
  alert(arg.msg);
}
```

Once the ajax request is complete, do_prompt will be executed.

You can apply a confirm pormpt on a form using `<form data-confirm="Are you sure?">`
this will prompt the user to confirm if they wish to continue with the form submission.
