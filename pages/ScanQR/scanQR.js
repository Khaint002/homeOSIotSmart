var html5QrCode;
var currentCameraIndex = 0;  // Index camera hiện tại
var devices = [];  // Danh sách các camera
var isScannerRunning = false;  // Biến theo dõi trạng thái quét
var currentCamera;

$(".start").click(function () {
    const dataId = $(this).data("id");
    $("#result-form").addClass("d-none");
    console.log(dataId);
    typeQR = dataId;

    if (dataId == 3) {
        const lotNumber = $("#lot-number").val();
        const classProduct = $("#classProduct").val().trim();
        const classProductNumber = $("#classProductNumber").val().trim();

        if (lotNumber === "0") {
            return toastr.error("Vui lòng chọn lô trước khi quét");
        }
        if (!classProduct) {
            return toastr.error("Vui lòng nhập Lớp sản phẩm!");
        }
        if (!classProductNumber || isNaN(classProductNumber) || Number(classProductNumber) <= 0) {
            return toastr.error("Vui lòng nhập số lượng cần quét hợp lệ (lớn hơn 0)!");
        }
    }

    startQRcode();
});

$("#toggle-camera").click(function () {
    if (currentCameraIndex == devices.length) {
        currentCamera = 0
    } else {
        currentCameraIndex = (currentCameraIndex + 1) % devices.length; // Chuyển qua camera tiếp theo
    }
    if (currentCamera == "user") {
        startScan(devices[currentCameraIndex].id, 'environment'); // Bắt đầu quét với camera mới
    } else {
        startScan(devices[currentCameraIndex].id, 'user');
    }
});

$("#close-scanner").click(function () {
    if (isScannerRunning) {
        html5QrCode.stop().then(ignore => {
            isScannerRunning = false;  // Đánh dấu scanner đã dừng
            $('#qr-popup').hide() // Đóng popup
        }).catch(err => {
            console.error("Lỗi khi dừng quét QR: ", err);
        });
    } else {
        $('#qr-popup').hide() // Nếu không có quét đang chạy, chỉ đóng popup
    }
});

$("#upload-qr").click(function () {
    $("#file-input").click();  // Mở hộp thoại chọn file
});

async function startScan(cameraId, cam) {
    try {
        currentCamera = cam;
        html5QrCode = new Html5Qrcode("qr-reader");

        await html5QrCode.start(
            cameraId,
            {
                fps: 30,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.7,
                videoConstraints: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    facingMode: { exact: cam },
                    advanced: [{ zoom: 2 }]
                }
            },
            onScanSuccess,
            onScanFailure
        );

        isScannerRunning = true;

        // Tùy chỉnh viền khung quét sau 100ms
        setTimeout(() => {
            const borderStyle = typeQR === 1
                ? '35vh 10vh'
                : '36vh 13vh';
            $('#qr-shaded-region').css('border-width', borderStyle);
        }, 100);

    } catch (err) {
        console.error("Lỗi khi khởi động camera:", err);
        toastr.error("Không thể khởi động camera. Vui lòng kiểm tra thiết bị!");
    }
}

function startQRcode() {
    $("#result-form-total, #result-form-title").addClass("d-none");
    $("#result-form-loading, #result-form-stationID, #result-form-stationName").removeClass("d-none");
    $("#qr-popup").show();

    // Lấy danh sách camera và bắt đầu quét
    Html5Qrcode.getCameras().then(devicesList => {
        devices = devicesList;
        if (devices?.length) {
            const cameraId = devices[currentCameraIndex].id;
            const facingMode = devices.length === 1 ? "user" : "environment";
            startScan(cameraId, facingMode);
        } else {
            console.error("Không tìm thấy thiết bị camera nào.");
        }
    }).catch(err => {
        console.error("Lỗi khi lấy danh sách camera:", err);
    });
}

async function onScanSuccess(decodedText, decodedResult) {
    // Ngừng camera
    try {
        await html5QrCode.stop();
        isScannerRunning = false;
    } catch (err) {
        console.error("Lỗi khi dừng camera: ", err);
    }

    const showError = (message) => {
        toastr.error(message);
        resetToErrorUI();
    };

    const resetToErrorUI = () => {
        showElement("result-form-total");
        hideElement("result-condition");
        hideElement("result-form-loading");
        showElement("result-form-title");
        hideElement("result-form-stationID");
        hideElement("result-form-stationName");
        hideElement("result-truycap");
    };

    const showElement = (id) => document.getElementById(id).classList.remove("d-none");
    const hideElement = (id) => document.getElementById(id).classList.add("d-none");

    const checkQRcode = decodedText.split(',');
    let data = [];

    // --------- Handle PRODUCT QR (typeQR 2 or 3) ----------
    if (typeQR === 2 || typeQR === 3) {
        const qrFormatted = decodedText.replaceAll(',', '$');
        data = await getDataMDQRcode(qrFormatted);

        if (checkQRcode.length === 3 && data.length > 0) {
            const [_, maSanPham, maSPCode] = checkQRcode;

            if (checkTab) {
                const lotId = $('#lot-number').val();
                const lotClass = $('#classProduct').val();
                const currentCount = (await getDM("https://central.homeos.vn/service_XD/service.svc", "DM_QRCODE", `LOT_ID='${lotId}' AND LOT_CLASS='${lotClass}'`)).data.length;

                if (data[0].LOT_ID == 0 && currentCount < $('#classProductNumber').val()) {
                    const willInsert = {
                        PR_KEY: data[0].PR_KEY,
                        QR_CODE: decodedText,
                        MA_SAN_PHAM: maSanPham,
                        LOT_ID: lotId,
                        LOT_CLASS: lotClass,
                        DATE_CREATE: new Date(),
                        ACTIVATE_WARRANTY: new Date('1999-01-01 07:00:00.000'),
                        USER_ID: UserID,
                        DATASTATE: "EDIT",
                    };
                    await add("DM_QRCODE", willInsert);
                    toastr.success("Quét QR và lưu thông tin thành công!");
                } else {
                    const msg = data[0].LOT_ID == lotId
                        ? "Sản phẩm đã tồn tại trong lô này!"
                        : "Sản phẩm đã thuộc 1 lô khác, vui lòng kiểm tra lại!";
                    showError(msg);
                }
                scanAgain();
            } else {
                // Hiển thị thông tin sản phẩm nếu không ở chế độ checkTab
                showElement("result-product");
                hideElement("result-form-loading");
                showElement("result-form");
                document.getElementById("result-product-truycap").disabled = false;
                document.getElementById("result-form-productName").value = maSanPham;
                document.getElementById("result-form-productCode").value = maSPCode.substring(1);
                document.getElementById("header-productName").textContent = `${maSanPham} - ${maSPCode.substring(1)}`;
                changeDataWarranty(data);
            }

        } else if (checkQRcode.length === 4) {
            const [_, productName, __, conditionCode] = checkQRcode;

            if (data.length === 0) {
                const insertData = {
                    QR_CODE: decodedText,
                    MA_SAN_PHAM: productName,
                    DATE_CREATE: new Date(),
                    ACTIVATE_WARRANTY: new Date('1999-01-01 07:00:00.000'),
                    USER_ID: UserID,
                    DATASTATE: "ADD",
                };

                try {
                    await add('DM_QRCODE', insertData);
                    toastr.success("Quét QR và lưu thông tin thành công!");
                    if (checkTab) {
                        scanAgain();
                    } else {
                        showElement("result-condition");
                        hideElement("result-form-loading");
                        showElement("result-form");
                        document.getElementById("result-condition-truycap").disabled = false;
                        document.getElementById("result-form-conditionName").value = productName;
                        document.getElementById("result-form-conditionCode").value = conditionCode;
                        const newData = await getDataMDQRcode(decodedText.replaceAll(',', '$'));
                        document.getElementById("header-conditionName").textContent = newData[0].PRODUCT_NAME + ` [${conditionCode}]`;
                        localStorage.setItem("itemCondition", JSON.stringify(newData));
                    }
                } catch (err) {
                    console.error("Error adding DM_QRCODE: ", err);
                }

            } else {
                // Đã tồn tại, chỉ hiển thị thông tin
                showElement("result-condition");
                hideElement("result-form-loading");
                showElement("result-form");
                document.getElementById("result-condition-truycap").disabled = false;
                document.getElementById("result-form-conditionName").value = productName;
                document.getElementById("result-form-conditionCode").value = conditionCode;
                document.getElementById("header-conditionName").textContent = data[0].PRODUCT_NAME + ` [${conditionCode}]`;
                localStorage.setItem("itemCondition", JSON.stringify(data));
            }

        } else if (typeQR === 3 && checkQRcode[0]?.startsWith("T20")) {
            const lotId = $('#lot-number').val();
            const lotClass = $('#classProduct').val();
            const currentCount = (await getDM("https://central.homeos.vn/service_XD/service.svc", "DM_QRCODE", `LOT_ID='${lotId}' AND LOT_CLASS='${lotClass}'`)).data.length;

            if (currentCount < $('#classProductNumber').val()) {
                const willInsert = {
                    QR_CODE: decodedText,
                    MA_SAN_PHAM: checkQRcode[1],
                    LOT_ID: lotId,
                    LOT_CLASS: lotClass,
                    DATE_CREATE: new Date(),
                    ACTIVATE_WARRANTY: new Date('1999-01-01 07:00:00.000'),
                    USER_ID: UserID,
                    DATASTATE: "ADD",
                };

                await add('DM_QRCODE', willInsert);
                toastr.success("Quét QR và lưu thông tin thành công!");

                const dataEdit = await getDataMDQRcode(decodedText.replaceAll(',', '$'));
                const errorInsert = {
                    TYPE: "ADD",
                    ERROR_NAME: "Hoàn thành sản phẩm",
                    DESCRIPTION: "Nhập sản phẩm vào hệ thống",
                    DATE_CREATE: new Date(),
                    ERROR_STATUS: 0,
                    QRCODE_ID: dataEdit[0].PR_KEY,
                    USER_ID: UserID,
                    DATASTATE: "ADD",
                };
                await add('WARRANTY_ERROR', errorInsert);
                scanAgain();
            } else {
                showError("Lớp đã quét đủ, vui lòng nhập lớp mới!");
                scanAgain();
            }

        } else {
            showError("Vui lòng quét đúng mã QR!");
        }

    // --------- Handle WORKSTATION QR ----------
    } else {
        if (decodedText.length > 6) {
            const [url, workstationId] = decodedText.split('$');
            data = await HOMEOSAPP.getNewData(localStorage.getItem("MATRAM"), `WORKSTATION_ID='${workstationId}'`, url);
            localStorage.setItem("URL", url);
            handleWorkstationUI(workstationId, data);

        } else if (decodedText.length === 6) {
            const domain = await getDomain(decodedText, 'domain');
            const url = `https://${domain}/service/service.svc/`;
            data = await HOMEOSAPP.getNewData(localStorage.getItem("MATRAM"), `WORKSTATION_ID='${decodedText}'`, url);
            localStorage.setItem("URL", url);
            handleWorkstationUI(decodedText, data);

        } else {
            showError("Vui lòng quét đúng mã QR!");
        }
    }

    function handleWorkstationUI(workstation, data) {
        if (data.data && data.data.length > 0) {
            showElement("result-form-total");
            hideElement("result-condition");
            hideElement("result-form-loading");
            showElement("result-form");
            document.getElementById("result-truycap").disabled = false;

            matram = workstation;
            getDomain(workstation).then((value) => {
                document.getElementById("result-form-stationID").value = workstation;
                document.getElementById("result-form-stationName").value = value[0].WORKSTATION_NAME;
                document.getElementById("footer-stationName").textContent = `${workstation} - ${value[0].WORKSTATION_NAME}`;
                checkCam = true;
                localStorage.setItem("MATRAM", workstation);
                toastr.success("Quét QR thành công");
            });
        } else {
            showError("Vui lòng quét đúng mã QR!");
        }
    }
}

function onScanFailure(error) {
    // Xử lý lỗi (nếu cần)
}

$("#file-input").change(async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const stopScannerIfRunning = async () => {
        if (isScannerRunning) {
            await html5QrCode.stop();
            isScannerRunning = false;
        }
    };

    const scanImageFile = async () => {
        try {
            const decodedText = await html5QrCode.scanFile(file);
            handleDecodedText(decodedText);
        } catch (err) {
            showScanError();
        }
    };

    const showScanError = () => {
        $("#result-form").removeClass("d-none");
        $("#result-form-total").removeClass("d-none");
        $("#result-condition").addClass("d-none");
        $("#result-form-loading").addClass("d-none");
        $("#result-form-title").removeClass("d-none");
        $("#result-form-stationID").addClass("d-none");
        $("#result-form-stationName").addClass("d-none");
        $("#result-truycap").addClass("d-none");
        toastr.error("Vui lòng quét đúng mã QR!");
    };

    const handleDecodedText = async (decodedText) => {
        $("#result-form").removeClass("d-none");

        const checkQRcode = decodedText.split(',');
        let data, domain, workstation;

        if (typeQR === 2 || typeQR === 3) {
            data = await getDataMDQRcode(decodedText.replaceAll(',', '$'));

            if (data.length > 0) {
                if (checkTab) {
                    if (data[0].LOT_ID == 0) {
                        const qrList = await getDM("https://central.homeos.vn/service_XD/service.svc", "DM_QRCODE", "LOT_ID='" + $('#lot-number').val() + "' AND LOT_CLASS='" + $('#classProduct').val() + "'");
                        if (qrList.data.length < $('#classProductNumber').val()) {
                            await add('DM_QRCODE', {
                                PR_KEY: data[0].PR_KEY,
                                QR_CODE: decodedText,
                                MA_SAN_PHAM: checkQRcode[1],
                                LOT_ID: $('#lot-number').val(),
                                LOT_CLASS: $('#classProduct').val(),
                                DATE_CREATE: new Date(),
                                ACTIVATE_WARRANTY: new Date('1999-01-01 07:00:00.000'),
                                USER_ID: UserID,
                                DATASTATE: "EDIT"
                            });
                            toastr.success("Quét QR và lưu thông tin thành công!");
                        } else {
                            toastr.error("Lớp đã quét đủ vui lòng nhập lớp mới!");
                        }
                    } else {
                        const msg = (data[0].LOT_ID == $('#lot-number').val())
                            ? "Sản phẩm đã tồn tại trong lô này!"
                            : "Sản phẩm đã thuộc 1 lô khác, vui lòng kiểm tra lại!";
                        toastr.error(msg);
                    }
                    scanAgain();
                } else {
                    $("#result-product").removeClass("d-none");
                    $("#result-form-loading").addClass("d-none");
                    $("#result-product-truycap").prop("disabled", false);
                    $("#result-form-productName").val(checkQRcode[1]);
                    $("#result-form-productCode").val(checkQRcode[2].substring(1));
                    $("#header-productName").text(`${checkQRcode[1]} - ${checkQRcode[2].substring(1)}`);
                    changeDataWarranty(data);
                }
            } else if (checkQRcode.length === 4) {
                await handleNewConditionQR(decodedText, checkQRcode);
            } else if (typeQR === 3 && checkQRcode[0].startsWith("T20")) {
                await handleProductInsert(decodedText, checkQRcode);
            } else {
                await handleInvalidOrStationQR(decodedText, checkQRcode);
            }
        } else {
            await handleWorkstationQR(decodedText);
        }
    };

    const handleNewConditionQR = async (decodedText, checkQRcode) => {
        const data = await getDataMDQRcode(decodedText.replaceAll(',', '$'));
        if (data.length === 0) {
            const insertData = {
                QR_CODE: decodedText,
                MA_SAN_PHAM: checkQRcode[1],
                DATE_CREATE: new Date(),
                ACTIVATE_WARRANTY: new Date('1999-01-01 07:00:00.000'),
                USER_ID: UserID,
                DATASTATE: "ADD",
            };
            await add('DM_QRCODE', insertData);
            toastr.success("Quét QR và lưu thông tin thành công!");
        }
        const latestData = await getDataMDQRcode(decodedText.replaceAll(',', '$'));
        $("#result-condition").removeClass("d-none");
        $("#result-form-loading").addClass("d-none");
        $("#result-condition-truycap").prop("disabled", false);
        $("#result-form-conditionName").val(checkQRcode[1]);
        $("#result-form-conditionCode").val(checkQRcode[3]);
        $("#header-conditionName").text(`${latestData[0].PRODUCT_NAME}[${checkQRcode[3]}]`);
        localStorage.setItem("itemCondition", JSON.stringify(latestData));
    };

    const handleProductInsert = async (decodedText, checkQRcode) => {
        const qrList = await getDM("https://central.homeos.vn/service_XD/service.svc", "DM_QRCODE", "LOT_ID='" + $('#lot-number').val() + "' AND LOT_CLASS='" + $('#classProduct').val() + "'");
        if (qrList.data.length < $('#classProductNumber').val()) {
            await add('DM_QRCODE', {
                QR_CODE: decodedText,
                MA_SAN_PHAM: checkQRcode[1],
                LOT_ID: $('#lot-number').val(),
                LOT_CLASS: $('#classProduct').val(),
                DATE_CREATE: new Date(),
                ACTIVATE_WARRANTY: new Date('1999-01-01 07:00:00.000'),
                USER_ID: UserID,
                DATASTATE: "ADD",
            });
            toastr.success("Quét QR và lưu thông tin thành công!");
            const qrData = await getDataMDQRcode(decodedText.replaceAll(',', '$'));
            await add('WARRANTY_ERROR', {
                TYPE: "ADD",
                ERROR_NAME: "Hoàn thành sản phẩm",
                DESCRIPTION: "Nhập sản phẩm vào hệ thống",
                DATE_CREATE: new Date(),
                ERROR_STATUS: 0,
                QRCODE_ID: qrData[0].PR_KEY,
                USER_ID: UserID,
                DATASTATE: "ADD",
            });
            scanAgain();
        } else {
            toastr.error("Lớp đã quét đủ vui lòng nhập lớp mới!");
            scanAgain();
        }
    };

    const handleInvalidOrStationQR = async (decodedText, checkQRcode) => {
        const dataLot = await getDM("https://central.homeos.vn/service_XD/service.svc", "WARRANTY_LOT", "1=1");
        const exists = dataLot.data.some(item => item.LOT_NUMBER === decodedText);
        if (!exists && checkQRcode[0].startsWith("T20")) {
            const insertData = {
                QR_CODE: decodedText,
                MA_SAN_PHAM: checkQRcode[1],
                DATE_CREATE: new Date(),
                ACTIVATE_WARRANTY: new Date('1999-01-01 07:00:00.000'),
                USER_ID: UserID,
                DATASTATE: "ADD",
            };
            await add('DM_QRCODE', insertData);
            toastr.success("Quét QR và lưu thông tin thành công!");
            if (checkTab) return scanAgain();

            $("#result-product").removeClass("d-none");
            $("#result-form-loading").addClass("d-none");
            $("#result-product-truycap").prop("disabled", false);
            $("#result-form-productName").val(checkQRcode[1]);
            $("#result-form-productCode").val(checkQRcode[2].substring(1));
            $("#header-productName").text(`${checkQRcode[1]} - ${checkQRcode[2].substring(1)}`);
            const qrData = await getDataMDQRcode(decodedText.replaceAll(',', '$'));
            await add('WARRANTY_ERROR', {
                TYPE: "ADD",
                ERROR_NAME: "Hoàn thành sản phẩm",
                DESCRIPTION: "Nhập sản phẩm vào hệ thống",
                DATE_CREATE: new Date(),
                ERROR_STATUS: 0,
                QRCODE_ID: qrData[0].PR_KEY,
                USER_ID: UserID,
                DATASTATE: "ADD",
            });
            changeDataWarranty(qrData);
        } else {
            showScanError();
        }
    };

    const handleWorkstationQR = async (decodedText) => {
        let resultArray = decodedText.split("$");
        let wsId = resultArray.length > 1 ? resultArray[1] : decodedText;
        let url = resultArray.length > 1
            ? resultArray[0]
            : "https://" + await getDomain(wsId, 'domain') + "/service/service.svc/";

        const data = await HOMEOSAPP.getNewData(localStorage.getItem("MATRAM"), "WORKSTATION_ID='" + wsId + "'", url);
        if (!data || data.length === 0) return showScanError();

        localStorage.setItem("URL", url);
        localStorage.setItem("MATRAM", wsId);
        $("#result-form-total").removeClass("d-none");
        $("#result-form-loading").addClass("d-none");
        $("#result-form").removeClass("d-none");

        const value = await getDomain(wsId);
        $("#result-form-stationID").val(wsId);
        $("#result-form-stationName").val(value[0].WORKSTATION_NAME);
        $("#footer-stationName").text(`${wsId} - ${value[0].WORKSTATION_NAME}`);
        $("#result-truycap").prop("disabled", false);
        checkCam = true;
        toastr.success("Quét QR thành công");
    };

    try {
        await stopScannerIfRunning();
        await scanImageFile();
    } catch (err) {
        console.error("Lỗi khi xử lý file QR:", err);
    }
});

async function getDomain(workstationID, type) {
    return new Promise(async (resolve, reject) => {
        // var listDomain = ["thoitiet.ifee.edu.vn", "namdinh.homeos.vn", "kttvthaibinh.com.vn", "cctl-dongthap.homeos.vn", "angiang.homeos.vn", "pctthn.homeos.vn", "thanthongnhat.homeos.vn", "ninhbinh.homeos.vn"]
        var domain;
        var data;
        console.log(HOMEOSAPP.listDomain);
        
        for (let i = 0; i < HOMEOSAPP.listDomain.length; i++) {
            data = await getDataStation(workstationID, HOMEOSAPP.listDomain[i]);

            if (data.length == 0 || data.length == undefined || data == null || data == '' || data == []) {
                domain = '';
            } else {
                domain = HOMEOSAPP.listDomain[i]
                break;
            }
        }
        if (type == "domain") {
            resolve(domain);
        } else {
            resolve(data);
        }
    });
}

function getDataStation(workstationID, domain) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `https://${domain}/Service/Service.svc/ApiServicePublic/GetDataWorkStation/WORKSTATION_ID='${workstationID}'`,
            type: "GET",
            dataType: "jsonp",
            contentType: "application/json; charset=utf-8",
            success: function (msg) {
                try {
                    const data = JSON.parse(msg);
                    if (Array.isArray(data) && data.length > 0) {
                        const item = {
                            CodeWorkStation: workstationID,
                            NameWorkStation: data[0].WORKSTATION_NAME,
                            domain: domain,
                            date: getCurrentTime(),
                            workstationType: data[0].TEMPLATE_TOOLTIP
                        };
                        HOMEOSAPP.itemHistory = item;
                        localStorage.setItem('itemHistory', JSON.stringify(item));
                        resolve(data);
                    } else {
                        reject("Dữ liệu trả về không hợp lệ hoặc trống");
                    }
                } catch (err) {
                    reject("Lỗi phân tích dữ liệu JSON: " + err);
                }
            },
            error: function (xhr, status, error) {
                reject(`Lỗi khi gọi API: ${status} - ${error}`);
            }
        });
    });
}

function getCurrentTime(time) {
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

function openTab(evt, tabName) {
    $('.tab-content').removeClass('active');
    $('.tablinks').removeClass('active');
    $('#' + tabName).addClass('active');
    $(evt.currentTarget).addClass('active');
}

$("#truycap").click(function () {
    getInputValue()
});

async function getInputValue() {
    var inputValue = document.getElementById("device_name").value;
    if (inputValue == null || inputValue == "") {
        toastr.error("Vui lòng nhập mã trạm!");
    } else {
        $("#loading-popup").show()
        CheckWorkStation(inputValue)
    }
}

async function CheckWorkStation(workstationID) {
    // var listDomain = ["thoitiet.ifee.edu.vn", "namdinh.homeos.vn", "kttvthaibinh.com.vn", "cctl-dongthap.homeos.vn", "angiang.homeos.vn", "pctthn.homeos.vn", "thanthongnhat.homeos.vn", "ninhbinh.homeos.vn"]
    var domain;
    var data;
    for (let i = 0; i < HOMEOSAPP.listDomain.length; i++) {
        data = await getDataStation(workstationID, HOMEOSAPP.listDomain[i]);

        if (data.length == 0 || data.length == undefined || data == null || data == '' || data == []) {
            domain = '';
        } else {
            domain = HOMEOSAPP.listDomain[i];
            break;
        }
    }
    if (domain == '') {
        toastr.error("Mã trạm không tồn tại");
        $('#loading-popup').hide()
    } else {
        localStorage.setItem("URL", "https://" + domain + "/Service/Service.svc");
        //$("#result").text("Kết quả quét: " + data[0].WORKSTATION_ID +"- Trạm:"+ data[0].WORKSTATION_NAME);
        // document.getElementById("footer-stationName").textContent = data[0].WORKSTATION_ID + " - " + data[0].WORKSTATION_NAME;
        localStorage.setItem("MATRAM", data[0].WORKSTATION_ID);
        toastr.success("Truy cập thành công!");
        $("#content-block").load("https://home-os-iot-smart.vercel.app/pages/KTTV/kttv.html");
    }
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

function scanAgain() {
    console.log("scan2");
    // document.getElementById("footer-instruct-scanQR").classList.add("d-none");
    document.getElementById("result-form").classList.add("d-none");
    document.getElementById("file-input").value = '';
    startQRcode();
}

$("#result-truycap").click(function () {
    document.getElementById("result-truycap").disabled = true;
    $("#loading-popup").show();
    $("#content-block").load("https://home-os-iot-smart.vercel.app/pages/KTTV/kttv.html");
});

$("#PickApp-button-pick").click(function () {
    $("#content-block").load("https://home-os-iot-smart.vercel.app/pages/History/history.html");
});

$("#tab-scan-qr").click(function (event) {
    openTab(event, 'tab1')
});
$("#tab-text").click(function (event) {
    openTab(event, 'tab2')
});
$("#tab-scan-qr").click();