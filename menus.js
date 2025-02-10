$(".iconApp").click(function() {
    let clickedElement = $(this); // Lấy phần tử được click
    let buttonId = clickedElement.attr("id"); // Lấy id của nó

    alert("Bạn đã click vào: " + buttonId);
});