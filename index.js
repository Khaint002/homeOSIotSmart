var typeQR;
var listDomain = [];
var checkTabHistory = 0;
var checkReport = '';
let historyStack = ['pickApp'];
var UserID = localStorage.getItem("userID");
var DataUser = JSON.parse(localStorage.getItem("userInfo"));
let screens = document.querySelectorAll('.app > div[id]');

setTimeout(() => {
    document.getElementById("LoadScreen").classList.add("d-none");
    document.getElementById("LogoLoadScreen").classList.add("hidden");
    // document.getElementById("pickApp").classList.remove("hidden");
    // document.getElementById("guarantee").classList.remove("hidden");
    console.log(1);
    
    getListDomain()
    $("#content-block").load("./pages/menu/menu.html");
}, 2000);

let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
            let target = mutation.target;
            let isHidden = target.classList.contains('hidden');
            let id = target.id;

            if (!isHidden && id && !historyStack.includes(id) && id != 'LoadScreen') {
                historyStack.push(id);
            }
        }
    });
});

screens.forEach(screen => observer.observe(screen, { attributes: true }));

if (typeof HomeOS !== 'undefined') {
    HomeOS.goBack = function () {
        if (historyStack.length <= 1) {
            return;
        }
        let currentScreen = historyStack.pop();
        document.getElementById(currentScreen).classList.add('hidden');
        let prevScreen = historyStack[historyStack.length - 1];
        document.getElementById(prevScreen).classList.remove('hidden');
    };
}

async function getListDomain() {
    const datatest = await getDM("https://central.homeos.vn/service_XD/service.svc", 'WARRANTY_SERVICE', "1=1");
    for (let i = 0; i < datatest.data.length; i++) {
        listDomain.push(datatest.data[i].DOMAIN);
    }
}


async function getDM(url, table_name, c, check) {
    let user_id_getDm = 'admin';
    let Sid_getDM = 'cb880c13-5465-4a1d-a598-28e06be43982';
    if(check == "NotCentral"){
        const dataUser = await checkRoleUser("dev", sha1Encode("1" + "@1B2c3D4e5F6g7H8").toString(), url+'/');
        user_id_getDm = dataUser[0].StateName;
        Sid_getDM = dataUser[0].StateId;
    }
    const d = {
        // Uid: 'vannt',
        // Sid: 'b99213e4-a8a5-45f4-bb5c-cf03ae90d8d7',
        Uid: user_id_getDm,
        Sid: Sid_getDM,
        tablename: table_name,
        c: c,
        other: '',
        cmd: ''
    };
    
    // const Url = 'https://DEV.HOMEOS.vn/service/service.svc/';

    return new Promise((resolve, reject) => {
        $.ajax({
            url: url+"/getDm?callback=?",
            type: "GET",
            dataType: "jsonp",
            data: d,
            contentType: "application/json; charset=utf-8",
            success: function (msg) {
                try {
                    let state = JSON.parse(msg);
                    resolve(state);  // Trả về dữ liệu khi thành công
                } catch (error) {
                    reject(error);  // Bắt lỗi nếu JSON parse thất bại
                }
            },
            complete: function (data) {
                // Có thể thêm xử lý khi request hoàn thành ở đây nếu cần
            },
            error: function (e, t, x) {
                HomeOS.Service.SetActionControl(true);
                HomeOS.Service.ShowLabel('Lỗi dữ liệu');
                reject(e);  // Trả về lỗi nếu thất bại
            }
        });
    });
}

  