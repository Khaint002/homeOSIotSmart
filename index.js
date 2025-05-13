var HOMEOSAPP = {};
HOMEOSAPP.application = "";
var typeQR;
HOMEOSAPP.listDomain = [];
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
    $("#content-block").load("https://home-os-iot-smart.vercel.app/pages/menu/menu.html");
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
    const datatest = await HOMEOSAPP.getDM("https://central.homeos.vn/service_XD/service.svc", 'WARRANTY_SERVICE', "1=1");
    for (let i = 0; i < datatest.data.length; i++) {
        HOMEOSAPP.listDomain.push(datatest.data[i].DOMAIN);
    }
}


HOMEOSAPP.getDM = async function (url, table_name, c, check) {
    let user_id_getDm = 'admin';
    let Sid_getDM = 'cb880c13-5465-4a1d-a598-28e06be43982';
    if(check == "NotCentral"){
        let dataUser;
        if(url == "https://cctl-dongthap.homeos.vn/service/service.svc" || url == "https://pctthn.homeos.vn/service/service.svc"){
            dataUser = await checkRoleUser("admin", sha1Encode("123" + "@1B2c3D4e5F6g7H8").toString(), url+'/');
        } else if(url == "https://thanthongnhat.homeos.vn/service/service.svc"){
            dataUser = await checkRoleUser("admin", sha1Encode("1" + "@1B2c3D4e5F6g7H8").toString(), url+'/');
        } else {
            dataUser = await checkRoleUser("dev", sha1Encode("1" + "@1B2c3D4e5F6g7H8").toString(), url+'/');
        }
         
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

HOMEOSAPP.add = async function (table, data, URL, check) {
    // const d = {Uid: "vannt", Sid:'3d798037-9bd9-4195-8673-a4794547d2fd', tablename:table, jd:JSON.stringify(data), ex:''};
    let user_id_getDm = 'admin';
    let Sid_getDM = 'cb880c13-5465-4a1d-a598-28e06be43982';
    let url = 'https://central.homeos.vn/service_XD/service.svc';
    if(check == "NotCentral"){
        url = URL;
        let dataUser;
        if(url.toLowerCase() == "https://cctl-dongthap.homeos.vn/service/service.svc" || url.toLowerCase() == "https://pctthn.homeos.vn/service/service.svc"){
            dataUser = await checkRoleUser("admin", sha1Encode("123" + "@1B2c3D4e5F6g7H8").toString(), url+'/');
        } else if(url.toLowerCase() == "https://thanthongnhat.homeos.vn/service/service.svc"){
            dataUser = await checkRoleUser("admin", sha1Encode("1" + "@1B2c3D4e5F6g7H8").toString(), url+'/');
        } else {
            dataUser = await checkRoleUser("dev", sha1Encode("1" + "@1B2c3D4e5F6g7H8").toString(), url+'/');
        }
        
        user_id_getDm = dataUser[0].StateName;
        Sid_getDM = dataUser[0].StateId;
    }
    
    const d = { Uid: user_id_getDm, Sid: Sid_getDM, tablename: table, jd: JSON.stringify(data), ex: '' };

    return new Promise((resolve, reject) => {
        $.ajax({
            // url: "https://DEV.HOMEOS.vn/service/service.svc/ExecuteData?callback=?",
            url: url+"/ExecuteData?callback=?",
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
            },
            error: function (e, t, x) {
            }
        });
    });
}

HOMEOSAPP.WorkstationStatistics = async function(url, c, check, code) {
    let user_id_getDm = 'admin';
    let Sid_getDM = 'cb880c13-5465-4a1d-a598-28e06be43982';
    if(check == "NotCentral"){
        let dataUser;
        if(url.toLowerCase() == "https://cctl-dongthap.homeos.vn/service/service.svc" || url.toLowerCase() == "https://pctthn.homeos.vn/service/service.svc"){
            dataUser = await checkRoleUser("admin", sha1Encode("123" + "@1B2c3D4e5F6g7H8").toString(), url+'/');
        } else if(url.toLowerCase() == "https://thanthongnhat.homeos.vn/service/service.svc"){
            dataUser = await checkRoleUser("admin", sha1Encode("1" + "@1B2c3D4e5F6g7H8").toString(), url+'/');
        } else {
            dataUser = await checkRoleUser("dev", sha1Encode("1" + "@1B2c3D4e5F6g7H8").toString(), url+'/');
        }
        
        user_id_getDm = dataUser[0].StateName;
        Sid_getDM = dataUser[0].StateId;
    }
    const maTram = localStorage.getItem("MATRAM");
    const d = {
        // Uid: 'vannt',
        // Sid: 'b99213e4-a8a5-45f4-bb5c-cf03ae90d8d7',
        Uid: user_id_getDm,
        Sid: Sid_getDM,
        c: c
    };
    
    // const Url = 'https://DEV.HOMEOS.vn/service/service.svc/';

    return new Promise((resolve, reject) => {
        $.ajax({
            url: url+"/WorkstationStatistics?callback=?",
            type: "GET",
            dataType: "jsonp",
            data: d,
            contentType: "application/json; charset=utf-8",
            success: function (msg) {
                try {
                    let state = JSON.parse(msg);
                    const result = state.DATA.find(obj => obj.hasOwnProperty("DN"+maTram+"3"));
                    const dataArray = result["DN"+maTram+"3"];
                    resolve(dataArray);  // Trả về dữ liệu khi thành công
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

HOMEOSAPP.getNewData = function (workstation, c, url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url + "/GetNewData?w=" + workstation,
            type: "GET",
            dataType: "jsonp",
            contentType: "application/json; charset=utf-8",
            success: function (msg) {
                try {
                    let state = JSON.parse(msg);
                    resolve(state); // Trả về dữ liệu khi thành công
                } catch (error) {
                    reject(error); // Bắt lỗi nếu JSON parse thất bại
                }
            },
            complete: function (data) {
                // Có thể thêm xử lý khi request hoàn thành ở đây nếu cần
            },
            error: function (e, t, x) {
                document.getElementById("result-form-total").classList.remove("d-none");
                document.getElementById("result-condition").classList.add("d-none");
                document.getElementById("result-form-loading").classList.add("d-none");
                document.getElementById("result-form").classList.remove("d-none");
                document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
                document.getElementById("result-form-title").classList.remove("d-none");
                document.getElementById("result-form-stationID").classList.add("d-none");
                document.getElementById("result-form-stationName").classList.add("d-none");
                document.getElementById("result-truycap").classList.add("d-none");
                //toastr.error("Vui lòng quét đúng mã QR!");
            },
        });
    });
}

HOMEOSAPP.getCurrentTime = function(time) {
    // Tạo đối tượng Date mới để lấy thời gian hiện tại
    let now;
    if (time) {
        now = new Date(time);
    } else {
        now = new Date();
    }

    const ngay = now.getDate(); // Ngày (1-31)
    const thang = now.getMonth() + 1; // Tháng (0-11) nên cần +1
    const nam = now.getFullYear(); // Năm (4 chữ số)
    // Lấy giờ, phút, giây
    const hours = now.getHours();   // Giờ (0-23)
    const minutes = now.getMinutes(); // Phút (0-59)
    const seconds = now.getSeconds(); // Giây (0-59)

    // Định dạng giờ thành dạng HH:MM:SS
    const chuoiNgay = `${ngay.toString().padStart(2, '0')}/${thang.toString().padStart(2, '0')}/${nam}`;
    const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Hiển thị giờ hiện tại
    if (time) {
        document.getElementById("lateDateTime").textContent = chuoiNgay + " " + currentTime;
    }
    return chuoiNgay + " " + currentTime;
}

HOMEOSAPP.getDataChart = function(typeTime, start, end, type, zone, url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url + "/ApiServicePublic/" + "GetDataFilterLogzone" + "/" + "TYPE_TIME='" + typeTime + "',START_DATE='" + start + "',END_DATE='" + end + "',TYPE_VALUE='" + type + "',ZONE_ADDRESS='" + zone + "'",
            type: "GET",
            dataType: "jsonp",
            contentType: "application/json; charset=utf-8",
            success: function (msg) {
                try {
                    let state = JSON.parse(msg);
                    resolve(state); // Trả về dữ liệu khi thành công
                } catch (error) {
                    reject(error); // Bắt lỗi nếu JSON parse thất bại
                }
            },
            complete: function (data) {
                // Có thể thêm xử lý khi request hoàn thành ở đây nếu cần
            },
            error: function (e, t, x) {
                toastr.error("Lấy dữ liệu bị lỗi vui lòng thử lại sau!");
            },
        });
    });
}

function checkRoleUser(user_id, password, url, check) {
    let sessionItems = JSON.parse(localStorage.getItem('dataSession')) || [];

    if (check === "Export") {
        sessionItems = sessionItems.filter(item => item.url !== url);
        localStorage.setItem('dataSession', JSON.stringify(sessionItems));
    }
    // Tìm session trùng với URL
    const existingSession = sessionItems.find(item => item.url === url);

    if (existingSession) {
        // Nếu đã có session → trả về luôn
        return Promise.resolve([{
            StateName: user_id,
            StateId: existingSession.sid // giả sử bạn lưu `sid` ở đây
        }]);
    }

    // Nếu chưa có session, gọi API
    const d = {
        Uid: user_id,
        p: password,
        ip: '0.0.0.0',
        a: '6fba9a59-46f1-42e6-baea-b2479fa1eb3b'
    };

    return new Promise((resolve, reject) => {
        $.ajax({
            url: url + "GetSessionId?callback=?",
            type: "GET",
            dataType: "jsonp",
            data: d,
            contentType: "application/json; charset=utf-8",
            success: function (msg) {
                try {
                    const state = JSON.parse(msg);
                    const newSession = {
                        url: url,
                        sid: state[0]?.StateId || '', // lưu sid nếu có
                        name: state[0]?.StateName || user_id
                    };
                    // Cập nhật localStorage
                    sessionItems.push(newSession);
                    localStorage.setItem('dataSession', JSON.stringify(sessionItems));
                    resolve(state);
                } catch (error) {
                    reject(error);
                }
            },
            error: function (e, t, x) {
                reject(e);
            }
        });
    });
}

function roundToTwoDecimals(num) {
    if (Number.isInteger(num)) {
        return num; // Nếu là số nguyên thì trả về nguyên gốc
    }
    return Math.round(num * 100) / 100; // Làm tròn đến 2 chữ số thập phân
}

var chartConfigs = [
    { id: "lineBarChart", varName: "lineBarChart", zone: "RD", label: "Lượng mưa (mm)", unit: "mm", type: "bar", color: "rgba(75, 192, 192, 0.5)", border: "rgba(75, 192, 192, 1)", divideBy10: true },
    { id: "ChartRT", varName: "ChartRT", zone: "RT", label: "Nhiệt độ (°C)", unit: "°C", type: "line", color: "rgb(173 14 14)", border: "rgb(173 14 14)", divideBy10: true, tension: 0.4 },
    { id: "ChartRH", varName: "ChartRH", zone: "RH", label: "Độ ẩm (%)", unit: "%", type: "line", color: "rgb(13,154,154, 0.5)", border: "rgb(13,154,154)", divideBy10: true, fill: true, tension: 0.4, min: 0, max: 100 },
    { id: "ChartRP", varName: "ChartRP", zone: "RP", label: "Áp suất (hPa)", unit: "hPa", type: "line", color: "rgb(40, 167, 69)", border: "rgb(40, 167, 69)", divideBy10: true, dashed: true },
    { id: "ChartRN", varName: "ChartRN", zone: "RN", label: "Mực nước (cm)", unit: "cm", type: "line", color: "rgb(0,95,95, 0.5)", border: "rgb(13,154,154)", divideBy10: false, fill: true, tension: 0.4 },
    { id: "ChartSS", varName: "ChartSS", zone: "SS", label: "Độ mặn (ppt)", unit: "ppt", type: "line", color: "rgb(40, 167, 69)", border: "rgb(40, 167, 69)", divideBy10: true, tension: 0.4 },
    { id: "ChartEC", varName: "ChartEC", zone: "EC", label: "Độ dẫn điện (μs/cm)", unit: "μs/cm", type: "line", color: "rgb(0,95,95)", border: "rgb(13,154,154)", divideBy10: true, tension: 0.4 }
];

var charts = {};

HOMEOSAPP.createChartData = function(data, type, typeData) {
    // Destroy old charts
    chartConfigs.forEach(cfg => {
        if (charts[cfg.varName]) {
            charts[cfg.varName].destroy();
        }
    });

    // Xử lý dữ liệu
    var datasets = {};
    var labels = {};

    chartConfigs.forEach(cfg => {
        datasets[cfg.zone] = [];
        labels[cfg.zone] = [];
    });

    $.each(data, function (i, item) {
        let zone = item.ZONE_PROPERTY;
        let config = chartConfigs.find(c => c.zone === zone);
        if (!config) return;

        if (zone === 'RD' || item.AverageValue !== 0) {
            let value;
            console.log(zone);
            
            if(zone == 'SS'){
                value = config.divideBy10 ? item.AverageValue / 10000 : item.AverageValue;
            } else if(zone == 'EC'){
                value = config.divideBy10 ? item.AverageValue / 1000 : item.AverageValue;
            } else {
                value = config.divideBy10 ? item.AverageValue / 10 : item.AverageValue;
            }
            value = roundToTwoDecimals(value).toFixed(2);
            labels[zone].push(item.Label);
            datasets[zone].push(value);
        }
    });

    let labelSuffix = typeData === "NGAY" ? "giờ" : "";

    chartConfigs.forEach(cfg => {
        let ctx = document.getElementById(cfg.id).getContext('2d');
        let dataSet = [{
            type: cfg.type,
            label: cfg.label,
            data: datasets[cfg.zone],
            backgroundColor: cfg.color,
            borderColor: cfg.border,
            borderWidth: 1,
            fill: cfg.fill ? 'start' : false,
            tension: cfg.tension || 0,
            borderDash: cfg.dashed ? [5, 5] : undefined
        }];

        charts[cfg.varName] = new Chart(ctx, HOMEOSAPP.createChart("bar", labels[cfg.zone], [], cfg.unit, "", dataSet, labelSuffix, cfg.min, cfg.max));
    });

    $("#loading-spinner").addClass("d-none");
}

// hàm để tạo chart
HOMEOSAPP.createChart = function (type, Label, Data, Unit, LabelData, dataSet, labelNgay, Min, Max) {
    return {
        type: type, // Loại biểu đồ
        data: {
            labels: Label,
            datasets: dataSet
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Không giữ tỷ lệ khung hình
            responsive: true,
            scales: {
                y: {  // Sử dụng 'y' thay vì 'yAxes'
                    beginAtZero: false,
                    ticks: {
                        callback: function (value, index, values) {
                            return roundToTwoDecimals(value) + ' ' + Unit;  // Thêm đơn vị Volts vào mỗi giá trị trục y
                        }
                    },
                    min: Min ?? undefined,
                    max: Max ?? undefined,
                }
            },
            interaction: {
                mode: 'nearest', // hoặc 'index'
                axis: 'x',       // hoặc 'y', hoặc 'xy'
                intersect: false // Đảm bảo tooltip hiển thị ngay cả khi không chạm chính xác
            },
            plugins: {
                tooltip: { // Sử dụng 'plugins.tooltip' thay vì 'tooltips'
                    callbacks: {
                        title: function (tooltipItems) {
                            const index = tooltipItems[0].dataIndex; // Lấy index của điểm dữ liệu
                            return Label[index] + " " + labelNgay; // Thay "labelNgay" bằng array chứa thời gian
                        },
                        label: function (tooltipItem) {
                            let label = tooltipItem.dataset.label || ''; // Lấy label từ dataset
                            if (label) {
                                label += ': ';
                            }
                            label += tooltipItem.raw + ' ' + Unit; // Sử dụng tooltipItem.raw để lấy giá trị y
                            return label;
                        }
                    }
                }
            }
        }
    }
}

HOMEOSAPP.formatDateTime = function(date) {
    const now = new Date(date);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const formattedDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDatetime
}

function sha1Encode(message) {
    function rotate_left(n, s) {
        return (n << s) | (n >>> (32 - s));
    }

    function cvt_hex(val) {
        let str = "";
        let i;
        let v;
        for (i = 7; i >= 0; i--) {
            v = (val >>> (i * 4)) & 0x0f;
            str += v.toString(16);
        }
        return str;
    }

    function utf8_encode(str) {
        return unescape(encodeURIComponent(str));
    }

    let blockstart;
    let i, j;
    const W = new Array(80);
    let H0 = 0x67452301;
    let H1 = 0xEFCDAB89;
    let H2 = 0x98BADCFE;
    let H3 = 0x10325476;
    let H4 = 0xC3D2E1F0;
    let A, B, C, D, E;
    let temp;

    message = utf8_encode(message);
    const msg_len = message.length;

    const word_array = [];
    for (i = 0; i < msg_len - 3; i += 4) {
        j = (message.charCodeAt(i) << 24) |
            (message.charCodeAt(i + 1) << 16) |
            (message.charCodeAt(i + 2) << 8) |
            message.charCodeAt(i + 3);
        word_array.push(j);
    }

    switch (msg_len % 4) {
        case 0:
            i = 0x080000000;
            break;
        case 1:
            i = (message.charCodeAt(msg_len - 1) << 24) | 0x0800000;
            break;
        case 2:
            i = (message.charCodeAt(msg_len - 2) << 24) |
                (message.charCodeAt(msg_len - 1) << 16) |
                0x08000;
            break;
        case 3:
            i = (message.charCodeAt(msg_len - 3) << 24) |
                (message.charCodeAt(msg_len - 2) << 16) |
                (message.charCodeAt(msg_len - 1) << 8) |
                0x80;
            break;
    }

    word_array.push(i);

    while ((word_array.length % 16) !== 14) word_array.push(0);

    word_array.push(msg_len >>> 29);
    word_array.push((msg_len << 3) & 0x0ffffffff);

    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
        for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
        for (i = 16; i <= 79; i++) W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;

        for (i = 0; i <= 19; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (i = 20; i <= 39; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (i = 40; i <= 59; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (i = 60; i <= 79; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }

    const sha1hash = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
    return sha1hash.toLowerCase();
}

$("#result-scanagain").click(function () {
    document.getElementById("result-form-total").classList.add("d-none");
    document.getElementById("result-form-loading").classList.remove("d-none");
    document.getElementById("result-form-title").classList.add("d-none");
    document.getElementById("result-form-stationID").classList.remove("d-none");
    document.getElementById("result-form-stationName").classList.remove("d-none");
    document.getElementById("result-truycap").classList.remove("d-none");
    scanAgain();
});