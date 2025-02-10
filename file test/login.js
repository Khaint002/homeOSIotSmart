HomeOS.Login = {};
HomeOS.linkbase = "";
HomeOS.Login.loginClick = function () {
	HomeOS.setItem("URL_SERVICE", "https://central.homeos.vn/service_XD/service.svc/");
	HomeOS.linkbase = HomeOS.getItem("URL_SERVICE");
    if(!HomeOS.linkbase || HomeOS.linkbase==""){
        location.href = "Service.html"; 
        return;
    }
    if ($("#txtUserName").val() == "") HomeOS.Login.ShowLabel('Tên đăng nhập không được trống!');
    else {
		let hashedPassword = CryptoJS.SHA1($("#txtPassword").val() + "@1B2c3D4e5F6g7H8").toString();
        HomeOS.Login.CheckRoleUser($("#txtUserName").val(), hashedPassword);
    }
}

HomeOS.Login.ShowLabel = function (content) {
    $('#lblLoginError').html(content);
    setTimeout(function () {
        $('#lblLoginError').html("");
    }, 8000);
}

HomeOS.Login.SetActionControl = function (state) {
    if (!state) {
        $("#txtPassword").attr("disabled", "disabled");
        $("#txtUserName").attr("disabled", "disabled");
        $("#btnLogin").attr("disabled", "disabled");
    }
    else {
        $("#txtUserName").removeAttr("disabled");
        $("#txtPassword").removeAttr("disabled");
        $("#btnLogin").removeAttr("disabled");
    }
}
HomeOS.Login.CheckRoleUser = function (user_id, password) {
    HomeOS.Login.SetActionControl(false);
    var getip = false
    if (getip == false) getip = '0.0.0.0'
	console.log(user_id, password, HomeOS.GetUUID())
    var d = { Uid: user_id, p: password, ip: getip, a: HomeOS.GetUUID() };//HomeOS.ASSEMBLY_FILE
    $.ajax({
        url: HomeOS.linkbase + "GetSessionId?callback=?",
        type: "GET",
        dataType: "jsonp",
        data: d,
        contentType: "application/json; charset=utf-8",
        success: function (msg) {
            var state = JSON.parse(msg);
            if (state != null &&
                state.StateId != "LOGIN_FAIL" &&
                state.StateId != "TOKEN_NOT_ACTIVED" &&
                state.StateId != "-1") {
                $("#txtPassword").val('');
                HomeOS.setItem("PAGE_SELECTED", "ADVANCED_DEVICE");
            	HomeOS.setItem("UUIDTOKEN_PRINT", state[0].StateId);
                HomeOS.setItem("UINFO", encode64(msg)); 
                HomeOS.setItem("USERID", user_id);
                location.href = "Device.html"; 
            }
            else {
                HomeOS.Login.ShowLabel(state.StateName);
            }
            HomeOS.Login.SetActionControl(true);
        },
        complete: function (data) {

        },
        error: function (e, t, x) {
            HomeOS.Login.SetActionControl(true);
            HomeOS.Login.ShowLabel('Lỗi dữ liệu');
        }
    });
}