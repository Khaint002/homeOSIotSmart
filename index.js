$(document).ready(function () {
    var DataUser;
    var typeQR;
    var listDomain = [];
    var checkTabHistory = 0;
    // Gọi hàm GetUser từ script chính
    DataUser = JSON.parse(localStorage.getItem("userInfo"));
    var UserID = localStorage.getItem("userID");
    async function handleUser() {
        if (UserID) {
            try {
                if (DataUser && DataUser.id === UserID) {
                    $(".userName").text(DataUser.name);
                    document.getElementById("PickApp-button-login").classList.add("d-none");
                    $(".userAvt").attr("src", DataUser.avatar);
                    document.getElementById("LogoPickScreen").style.paddingTop = "10vh";
                    const dataUserResponse = await getDM("WARRANTY_USER", "USER_ID='" + UserID + "'");
                    console.log(dataUserResponse.data);
                    if(dataUserResponse.data.length == 0){
                        const willInsertData = {
                            USER_ID: DataUser.id,
                            USER_NAME: DataUser.name,
                            USER_ROLE: "GUEST",
                            DATE_CREATE: new Date(),
                            DATASTATE: "ADD",
                        };
                        add('WARRANTY_USER', willInsertData);
                        localStorage.setItem('RoleUser', "GUEST");
                    } else {
                        console.log(dataUserResponse);
                        localStorage.setItem('RoleUser', dataUserResponse.data[0].USER_ROLE);
                    }
                } else if(DataUser != undefined) {
                    const dataUserResponse = await getDM("WARRANTY_USER", "USER_ID='" + UserID + "'");
                    console.log(dataUserResponse.data);
                    if(dataUserResponse.data.length == 0){
                        const willInsertData = {
                            USER_ID: DataUser.id,
                            USER_NAME: DataUser.name,
                            USER_ROLE: "GUEST",
                            DATE_CREATE: new Date(),
                            DATASTATE: "ADD",
                        };
                        add('WARRANTY_USER', willInsertData);
                    }
                } else {
                    localStorage.setItem('RoleUser', 'GUEST');
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        } else {
            // localStorage.setItem('RoleUser', 'GUEST');
            document.getElementById("QUYEN").classList.add("d-none");
            document.getElementById("LogoPickScreen").style.paddingTop = "10vh";
        }
        WarrantyCheckUser(localStorage.getItem("RoleUser"));
    }

    async function getListDomain() {
        const datatest = await getDM('WARRANTY_SERVICE', "1=1");
        for (let i = 0; i < datatest.data.length; i++) {
            listDomain.push(datatest.data[i].DOMAIN);
        }
    }

    // getListDomain();
    // handleUser();
    var historyItems = [];
    var waranntyItems = [];
    var CategoryItems = [];
    var DataCategory = [];
    var historyListDetail = $('#history-detail');
    var historyListCategoryDetail = $('#list-history-detail');
    var historyListCategoryAdd = $('#list-history-add');
    var listCategory = $('#history-setting-detail');
    var listWarrantyHistory = $('#history-warranty-detail');
    var listLotProduct = $('#lot-warranty-detail');
    var NameWorkStation;
    var intervalId; // Lưu ID của setInterval
    var checkTab = false;
    var checkAppQR;
    // var user_id = "admin";
    // var session = "7b504acc-988a-437a-890f-389765305b47";

    const buttons = document.querySelectorAll(".btn-chart");
    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            buttons.forEach((btn) => btn.classList.remove("active"));
            this.classList.add("active");
        });
    });
    function openTab(evt, tabName) {
        // Ẩn tất cả nội dung tab
        var tabContent = document.getElementsByClassName("tab-content");
        for (var i = 0; i < tabContent.length; i++) {
            tabContent[i].classList.remove("active");
        }

        // Xóa class 'active' trên tất cả các nút
        var tabLinks = document.getElementsByClassName("tablinks");
        for (var i = 0; i < tabLinks.length; i++) {
            tabLinks[i].classList.remove("active");
        }

        // Hiển thị tab được chọn và thêm class 'active' cho nút đã nhấn
        document.getElementById(tabName).classList.add("active");
        evt.currentTarget.classList.add("active");
    }
    function openTabGuarantee(evt, tabName) {
        // Ẩn tất cả nội dung tab
        
        var tabContent = document.getElementsByClassName("tab-content-guarantee");
        for (var i = 0; i < tabContent.length; i++) {
            tabContent[i].classList.remove("active");
        }

        // Xóa class 'active' trên tất cả các nút
        var tabLinks = document.getElementsByClassName("tablinkGuarantee");
        for (var i = 0; i < tabLinks.length; i++) {
            tabLinks[i].classList.remove("active");
        }

        // Hiển thị tab được chọn và thêm class 'active' cho nút đã nhấn
        document.getElementById(tabName).classList.add("active");
        evt.currentTarget.classList.add("active");
    }

    function checkHeight() {
        const viewportHeight = window.innerHeight;
        const historyDetail = document.getElementById('history-detail');
        historyDetail.style.height = (viewportHeight - 240) + 'px';
        const categoryDetail = document.getElementById('list-history-detail');
        categoryDetail.style.height = (viewportHeight - 530) + 'px';
        const category = document.getElementById('history-setting-detail');
        category.style.maxHeight = (viewportHeight - 200) + 'px';
    };
    // checkHeight();
    // window.addEventListener('resize', function () {
    //     const viewportHeight = window.innerHeight;
    //     const historyDetail = document.getElementById('history-detail');
    //     historyDetail.style.height = (viewportHeight - 240) + 'px'; // 80% chiều cao của thiết bị
    //     const categoryDetail = document.getElementById('list-history-detail');
    //     categoryDetail.style.height = (viewportHeight - 530) + 'px'; // 80% chiều cao của thiết bị
    //     const category = document.getElementById('history-setting-detail');
    //     category.style.maxHeight = (viewportHeight - 200) + 'px';
    // });
    // Mặc định mở tab đầu tiên
    // setTimeout(() => {
    //     document.getElementById("LoadScreen").classList.add("d-none");
    //     document.getElementById("LogoLoadScreen").classList.add("hidden");
    //     document.getElementById("pickApp").classList.remove("hidden");
    //     // document.getElementById("guarantee").classList.remove("hidden");
    // }, 2000);

    var maTram = '';
    function changeHistory() {
        document.getElementById("history").classList.remove("hidden");
        document.getElementById("homePage").classList.add("hidden");
        maTram = '';
    }
    function changeQRcode() {
        // openTab(event, 'tab1');
        document.getElementById("ScanQR").classList.remove("hidden");
        document.getElementById("homePage").classList.add("hidden");
        document.getElementById("history").classList.add("hidden");
        document.querySelector(".tablinkQR").click();
        maTram = '';
    }
    function OpenAddCategory() {
        $(".history-avt").addClass("d-none");
        document.getElementById("category-back").classList.remove("d-none");
        localStorage.setItem('listItemCategory', JSON.stringify([]));
        historyListCategoryAdd.empty()
        showHistoryCategory();
        document.getElementById("list-category").classList.add("d-none");
        document.getElementById("save-category").classList.remove("d-none");
    }
    function truyCap() {
        document.getElementById("footer-instruct-scanQR").classList.add("d-none");
        document.getElementById("result-form").classList.add("d-none");
        $('#qr-popup').hide();
        document.getElementById("ScanQR").classList.add("hidden");
        document.getElementById("history").classList.add("hidden");
        document.getElementById("homePage").classList.remove("hidden");
        matram = localStorage.getItem("MATRAM");
        $("button-modal-loading").click();
        saveHistory(localStorage.getItem('MATRAM'));
        checkTypeWorkstation()
        getDataMonitoring();
    }
    function DetailProduct() {
        document.getElementById("footer-instruct-scanQR").classList.add("d-none");
        document.getElementById("result-form").classList.add("d-none");
        document.getElementById("result-product").classList.add("d-none");
        document.getElementById("result-product").classList.add("d-none");
        document.getElementById("tab-0").classList.remove("active");
        document.getElementById("tab-1").classList.add("active");
        document.getElementById("btn-tab1").classList.add("menuWarranty");
        $('#qr-popup').hide()
        document.getElementById("ScanQRWarranty").classList.add("hidden");
        document.getElementById("guarantee").classList.remove("hidden");
        document.getElementById("menu-warranty").classList.remove("d-none");
        $('#loading-popup').hide()
        console.log('hide');

    }
    function scanAgain() {
        console.log("scan2");
        document.getElementById("footer-instruct-scanQR").classList.add("d-none");
        document.getElementById("result-form").classList.add("d-none");
        document.getElementById("file-input").value = '';
        startQRcode();
    }
    $(".start").click(function () {
        const buttonId = $(this).attr("id"); // Lấy id của nút
        const dataId = $(this).data("id"); // Lấy giá trị data-id
        $("#result-form").addClass("d-none");
        console.log(dataId);
        typeQR = dataId;
        if(dataId == 3){
            const lotNumber = $("#lot-number").val(); // Giá trị của select
            const classProduct = $("#classProduct").val().trim(); // Giá trị của input lớp sản phẩm
            const classProductNumber = $("#classProductNumber").val().trim(); // Giá trị của input số lượng quét
            let isValid = true;
            if (lotNumber === "0") {
                toastr.error("vui lòng chọn lô trước khi quét")
                isValid = false;
            } else if (classProduct === "") {
                toastr.error("Vui lòng nhập Lớp sản phẩm!");
                isValid = false;
            } else if (classProductNumber === "" || isNaN(classProductNumber) || Number(classProductNumber) <= 0) {
                toastr.error("Vui lòng nhập số lượng cần quét hợp lệ (lớn hơn 0)!");
                isValid = false;
            }
            if(isValid){
                startQRcode();
            }
        } else {
            startQRcode();
        }
    })
    $("#PickApp-button-mua").click(function () {
        loadPage("history.html");
        // $('#NameHistoryPage').text("Quan trắc:")
        // $('#descHistoryPage').text("Lịch sử truy cập")
        // $('#historySelect').removeClass("d-none");
        // $('#footerHistoryPage').text("thêm mới mã trạm hoặc chọn trạm đã lưu");

        // $('.workstation_access').removeClass("d-none");
        // $('.workstation_category').removeClass("d-none");
        // $('.warranty_scansQRcode').addClass("d-none");
        // $('.warranty_lot').addClass("d-none");
        // $('.warranty_scanQRcode').addClass("d-none");


        // historyListDetail.empty();
        // showAddWorkStationButton();
        // checkTabHistory = 1;
        // showHistory();
        // pickApp('MUA');
    });
    $("#PickApp-button-IOT").click(function () {
        pickApp('IOT');
    });
    $("#PickApp-button-pick").click(function () {
        showHistory();
        pickApp('PICK');
    });
    $("#PickApp-button-login").click(function () {
        pickApp('LOGIN');
    });
    $("#PickApp-button-warranty").click(function () {
        $('#NameHistoryPage').text("Sản phẩm:")
        $('#descHistoryPage').text("Lịch sử sản phẩm đã xem")
        $('#historySelect').addClass("d-none");
        $('#footerHistoryPage').text("Chọn sản phẩm đã xem hoặc thêm mới")

        $('.workstation_access').addClass("d-none");
        $('.workstation_category').addClass("d-none");
        $('.warranty_scansQRcode').removeClass("d-none");
        $('.warranty_lot').removeClass("d-none");
        $('.warranty_scanQRcode').removeClass("d-none");

        historyListDetail.empty();
        showAddWorkStationButton();
        checkTabHistory = 2;
        addItemWarranty();
        pickApp('GUA');
    });
    $("#backHistoryWarranty").click(function () {
        $('#ScanQRWarranty').addClass("hidden");
        $("#PickApp-button-warranty").click();
    });
    $(".Pre-pickApp").click(function () {
        stopInterval()
        pickApp('PRE');
    });
    $("#share-qrcode-workstation").click(function () {
        // Hiển thị popup với hiệu ứng modal
        $("#share-popup").show()

        // Xóa nội dung mã QR cũ
        $('#qrcode').empty();

        // Dữ liệu để tạo mã QR
        const text = localStorage.getItem("URL") + "$" + localStorage.getItem("MATRAM");
        document.getElementById("text-content-QRcode").textContent =
            localStorage.getItem("MATRAM") + " - " + JSON.parse(localStorage.getItem('itemHistory')).NameWorkStation;
        // Tạo mã QR
        QRCode.toCanvas(text, { width: 200 }, function (error, canvas) {
            if (error) {
                console.error("Lỗi khi tạo mã QR:", error);
                alert('Lỗi khi tạo mã QR!');
                return;
            }

            // Thêm canvas QR vào DOM
            $('#qrcode').append(canvas);

            // Tạo ảnh ẩn từ canvas (tùy chọn)
            const image = canvas.toDataURL('image/png');
            const img = $('<img>')
                .attr('src', image)
                .css({ display: 'none' }) // Ẩn ảnh đi
                .attr('id', 'hidden-image');
            $('#qrcode').append(img);
        });
    });

    $("#errorWarranty").click(function () {
        $("#error-popup").show();
    });
    $("#BackCodeQR").click(function () {
        $('#share-popup').hide();
    });
    $("#download-QRcode").click(function () {
        const img = $('#hidden-image')[0];

        if (!img) {
            alert('Chưa có mã QR để tải!');
        }

        // Tạo thẻ <a> để tải xuống
        const link = document.createElement('a');
        link.href = img.src;
        link.download = 'qrcode.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    $(".homepage-Pre-pickApp").click(function () {
        stopInterval();
        pickApp('PRE');
    });
    $("#tab-scan-qr").click(function (event) {
        openTab(event, 'tab1')
    });
    $("#tab-text").click(function (event) {
        openTab(event, 'tab2')
    });
    $("#tab-scan").click(function (event) {
        checkTab = false;
        openTabGuarantee(event, 'tab3')
    });
    $("#tab-history").click(function (event) {
        openTabGuarantee(event, 'tab4')
    });
    $("#truycap").click(function () {
        getInputValue()
    });
    $("#saveCategory").click(function () {
        saveCategory()
    });
    $(".ScanQRNext").click(function () {
        document.getElementById("RT").textContent = '-';
        document.getElementById("RH").textContent = '-';
        document.getElementById("energy").textContent = '-';
        document.getElementById("status").style.background = "red";
        document.getElementById("text-status").textContent = "Mất kết nối";
        document.getElementById("RP").textContent = '-';
        document.getElementById("RD").textContent = '0 mm';
        document.getElementById("lastTimeRain").textContent = '';
        document.getElementById("lateDateTime").textContent = "-";
        pickApp('HISTORY')
    });
    $(".WarrantyScanNext").click(function () {
        document.getElementById("ScanQRWarranty").classList.remove("hidden");
        document.getElementById("guarantee").classList.add("hidden");
        document.getElementById("menu-warranty").classList.add("d-none");
        document.getElementById("history").classList.add("hidden");

        document.querySelector(".tablinkGuarantee").click();
    });
    $("#button-list-ngay").click(function () {
        clickGetData('NGAY')
    });
    $("#button-list-tuan").click(function () {
        clickGetData('TUAN')
    });
    $("#button-list-thang").click(function () {
        clickGetData('THANG')
    });
    $("#button-list-nam").click(function () {
        clickGetData('NAM')
    });
    $("#result-scanagain").click(function () {
        document.getElementById("result-form-total").classList.add("d-none");
        document.getElementById("result-form-loading").classList.remove("d-none");
        document.getElementById("result-form-title").classList.add("d-none");
        document.getElementById("result-form-stationID").classList.remove("d-none");
        document.getElementById("result-form-stationName").classList.remove("d-none");
        document.getElementById("result-truycap").classList.remove("d-none");
        scanAgain()
    });
    $("#result-product-scanagain").click(function () {
        document.getElementById("result-product").classList.add("d-none");
        document.getElementById("result-form-loading").classList.remove("d-none");
        document.getElementById("result-product-title").classList.add("d-none");
        document.getElementById("result-form-productName").classList.remove("d-none");
        document.getElementById("result-form-productCode").classList.remove("d-none");
        document.getElementById("result-truycap").classList.remove("d-none");
        scanAgain()
    });
    $("#PickApp-button-scanQR").click(function () {
        if(checkTabHistory == 1){
            stopInterval()
            changeQRcode()
        } else if(checkTabHistory == 2){
            $(".WarrantyScanNext").click();
        }
    });
    $("#addWorkStation").click(function () {
        console.log(checkTabHistory);
        
        if(checkTabHistory == 1){
            changeQRcode()
        } else if(checkTabHistory == 2){
            $(".WarrantyScanNext").click();
        }
    });
    $("#addCategory").click(function () {
        OpenAddCategory()
    });
    $("#btnAddCategory").click(function () {
        OpenAddCategory()
    });
    $("#backCategory").click(function () {
        $(".history-avt").removeClass("d-none");
        document.getElementById("category-back").classList.add("d-none");
        document.getElementById("list-category").classList.remove("d-none");
        document.getElementById("save-category").classList.add("d-none");
        document.getElementById("detail-category").classList.add("d-none");
        showCategory();
        historyListCategoryAdd.empty();
    });
    $("#result-truycap").click(function () {
        document.getElementById("result-truycap").disabled = true;
        $("#loading-popup").show()
        truyCap()
    });
    $("#result-product-truycap").click(function () {
        document.getElementById("result-product-truycap").disabled = true;
        $("#loading-popup").show()
        DetailProduct();
    });
    $("#BackWarranty").click(function () {
        $("#error-popup").hide();
        $("#errorInput").val("");
        $("#errorType").val("");
        $("#errorDesc").val("");
    });
    // document.getElementById("historySelect").addEventListener("change", function () {
    //     const selectedValue = this.value; // Lấy giá trị đã chọn
    //     const selectedText = this.options[this.selectedIndex].text; // Lấy văn bản đã chọn
    //     showHistory(selectedValue);
    // });
    async function pickApp(type) {
        if (type == 'MUA') {
            document.getElementById("LoadScreen").classList.remove("d-none");
            document.getElementById("img-station").classList.remove("hidden");
            document.getElementById("pickApp").classList.add("hidden");
            setTimeout(() => {
                document.getElementById("LoadScreen").classList.add("d-none");
                document.getElementById("img-station").classList.add("hidden");
                document.getElementById("history").classList.remove("hidden");
            }, 2000);
        } else if (type == 'IOT') {
            window.location.href = "http://devices.homeos.vn/";
        } else if (type == 'PICK') {
            document.getElementById("history").classList.remove("hidden");
            document.getElementById("ScanQR").classList.add("hidden");
            document.getElementById("history-setting").classList.add("d-none");
            document.getElementById("history-homePage").classList.remove("d-none");
        } else if (type == 'PRE') {
            document.getElementById("history").classList.add("hidden");
            document.getElementById("homePage").classList.add("hidden");
            document.getElementById("pickApp").classList.remove("hidden");
            document.getElementById("guarantee").classList.add("hidden");
            document.getElementById("ScanQRWarranty").classList.add("hidden");
            document.getElementById("menu-warranty").classList.add("d-none");
            document.getElementById("footer-instruct-warranty").classList.add("d-none");
        } else if (type == 'HISTORY') {
            showHistory()
            document.getElementById("history").classList.remove("hidden");
            document.getElementById("homePage").classList.add("hidden");
        } else if (type == 'GUA') {
            document.getElementById("LoadScreen").classList.remove("d-none");
            document.getElementById("LogoLoadScreen").classList.remove("hidden");
            document.getElementById("history").classList.remove("hidden");
            setTimeout(() => {
                document.getElementById("LoadScreen").classList.add("d-none");
                document.getElementById("LogoLoadScreen").classList.add("hidden");
            }, 2000);

            // document.getElementById("ScanQRWarranty").classList.remove("hidden");

            document.getElementById("pickApp").classList.add("hidden");
            document.getElementById("footer-instruct-warranty").classList.remove("d-none");

            // document.querySelector(".tablinkGuarantee").click();

            $(".warrantyDetailProduct").removeClass("d-none");
            $("#ScanAllQRcode").addClass("d-none");
            $("#lotProduct").addClass("d-none");
            checkTab = false;
        } else if (type == 'LOGIN'){
            if (window.GetUser) {
                await window.GetUser();
                DataUser = JSON.parse(localStorage.getItem("userInfo"));
                $(".userName").text(DataUser.name);
                document.getElementById("PickApp-button-login").classList.add("d-none");
                $(".userAvt").attr("src", DataUser.avatar);
                document.getElementById("LogoPickScreen").style.paddingTop = '10vh';
                const dataUserResponse = await getDM("WARRANTY_USER", "USER_ID='" + UserID + "'");
                if(dataUserResponse.data.length == 0){
                    const willInsertData = {
                        USER_ID: DataUser.id,
                        USER_NAME: DataUser.name,
                        USER_ROLE: "GUEST",
                        DATE_CREATE: new Date(),
                        DATASTATE: "ADD",
                    };
                    add('WARRANTY_USER', willInsertData);
                }
            }
        }
    }
    async function CheckWorkStation(workstationID) {
        // var listDomain = ["thoitiet.ifee.edu.vn", "namdinh.homeos.vn", "kttvthaibinh.com.vn", "cctl-dongthap.homeos.vn", "angiang.homeos.vn", "pctthn.homeos.vn", "thanthongnhat.homeos.vn", "ninhbinh.homeos.vn"]
        var domain;
        var data;
        for (let i = 0; i < listDomain.length; i++) {
            data = await getDataStation(workstationID, listDomain[i]);

            if (data.length == 0 || data.length == undefined || data == null || data == '' || data == []) {
                domain = '';
            } else {
                domain = listDomain[i];
                break;
            }
        }
        if (domain == '') {
            toastr.error("Mã trạm không tồn tại");
            $('#loading-popup').hide()
        } else {
            localStorage.setItem("URL", "https://" + domain + "/Service/Service.svc");
            //$("#result").text("Kết quả quét: " + data[0].WORKSTATION_ID +"- Trạm:"+ data[0].WORKSTATION_NAME);
            document.getElementById("footer-stationName").textContent = data[0].WORKSTATION_ID + " - " + data[0].WORKSTATION_NAME;
            localStorage.setItem("MATRAM", data[0].WORKSTATION_ID);
            toastr.success("Truy cập thành công!");
            truyCap()
        }
    }
    // kiểm tra xem trạm nhập chạy ở service nào
    async function getDomain(workstationID, type) {
        return new Promise(async (resolve, reject) => {
            // var listDomain = ["thoitiet.ifee.edu.vn", "namdinh.homeos.vn", "kttvthaibinh.com.vn", "cctl-dongthap.homeos.vn", "angiang.homeos.vn", "pctthn.homeos.vn", "thanthongnhat.homeos.vn", "ninhbinh.homeos.vn"]
            var domain;
            var data;
            for (let i = 0; i < listDomain.length; i++) {
                data = await getDataStation(workstationID, listDomain[i]);

                if (data.length == 0 || data.length == undefined || data == null || data == '' || data == []) {
                    domain = '';
                } else {
                    domain = listDomain[i]
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

    async function getDataMonitoring() {
        createNewChart()
        const data = await getNewData(
            localStorage.getItem("MATRAM"),
            "WORKSTATION_ID='" + localStorage.getItem("MATRAM") + "'",
            localStorage.getItem("URL")
        );
        const item = JSON.parse(localStorage.getItem('itemHistory'));
        const TypeWorkstation = getDayMessage(item.workstationType);
        const dataChart = await getDataChart('NGAY', '', '', TypeWorkstation, localStorage.getItem("MATRAM"), localStorage.getItem("URL"));
        // const dataChart = await getDataChart('NGAY', '', '', 'RD---', localStorage.getItem("MATRAM"), localStorage.getItem("URL"));
        if (dataChart != []) {
            createChartData(dataChart, 'RD', 'NGAY')
        }

        changeDataHomePage(data.D);
        setInterval(async () => {
            const data = await getNewData(
                localStorage.getItem("MATRAM"),
                "WORKSTATION_ID='" + localStorage.getItem("MATRAM") + "'",
                localStorage.getItem("URL")
            );
            changeDataHomePage(data.D);
        }, 10000);
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

    function getIconWorkstation(type) {
        switch (type) {
            case "NAAM":
                return '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="color: #fff;" fill="currentColor" viewBox="0 0 640 512"><path d="M294.2 1.2c5.1 2.1 8.7 6.7 9.6 12.1l10.4 62.4c-23.3 10.8-42.9 28.4-56 50.3c-14.6-9-31.8-14.1-50.2-14.1c-53 0-96 43-96 96c0 35.5 19.3 66.6 48 83.2c.8 31.8 13.2 60.7 33.1 82.7l-56 39.2c-4.5 3.2-10.3 3.8-15.4 1.6s-8.7-6.7-9.6-12.1L98.1 317.9 13.4 303.8c-5.4-.9-10-4.5-12.1-9.6s-1.5-10.9 1.6-15.4L52.5 208 2.9 137.2c-3.2-4.5-3.8-10.3-1.6-15.4s6.7-8.7 12.1-9.6L98.1 98.1l14.1-84.7c.9-5.4 4.5-10 9.6-12.1s10.9-1.5 15.4 1.6L208 52.5 278.8 2.9c4.5-3.2 10.3-3.8 15.4-1.6zM208 144c13.8 0 26.7 4.4 37.1 11.9c-1.2 4.1-2.2 8.3-3 12.6c-37.9 14.6-67.2 46.6-77.8 86.4C151.8 243.1 144 226.5 144 208c0-35.3 28.7-64 64-64zm69.4 276c11 7.4 14 22.3 6.7 33.3l-32 48c-7.4 11-22.3 14-33.3 6.7s-14-22.3-6.7-33.3l32-48c7.4-11 22.3-14 33.3-6.7zm96 0c11 7.4 14 22.3 6.7 33.3l-32 48c-7.4 11-22.3 14-33.3 6.7s-14-22.3-6.7-33.3l32-48c7.4-11 22.3-14 33.3-6.7zm96 0c11 7.4 14 22.3 6.7 33.3l-32 48c-7.4 11-22.3 14-33.3 6.7s-14-22.3-6.7-33.3l32-48c7.4-11 22.3-14 33.3-6.7zm96 0c11 7.4 14 22.3 6.7 33.3l-32 48c-7.4 11-22.3 14-33.3 6.7s-14-22.3-6.7-33.3l32-48c7.4-11 22.3-14 33.3-6.7zm74.5-116.1c0 44.2-35.8 80-80 80l-271.9 0c-53 0-96-43-96-96c0-47.6 34.6-87 80-94.6l0-1.3c0-53 43-96 96-96c34.9 0 65.4 18.6 82.2 46.4c13-9.1 28.8-14.4 45.8-14.4c44.2 0 80 35.8 80 80c0 5.9-.6 11.7-1.9 17.2c37.4 6.7 65.8 39.4 65.8 78.7z"/></svg>';
            case "N":
                return '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="color: #fff;" fill="currentColor" class="bi bi-moisture" viewBox="0 0 16 16"><path d="M13.5 0a.5.5 0 0 0 0 1H15v2.75h-.5a.5.5 0 0 0 0 1h.5V7.5h-1.5a.5.5 0 0 0 0 1H15v2.75h-.5a.5.5 0 0 0 0 1h.5V15h-1.5a.5.5 0 0 0 0 1h2a.5.5 0 0 0 .5-.5V.5a.5.5 0 0 0-.5-.5zM7 1.5l.364-.343a.5.5 0 0 0-.728 0l-.002.002-.006.007-.022.023-.08.088a29 29 0 0 0-1.274 1.517c-.769.983-1.714 2.325-2.385 3.727C2.368 7.564 2 8.682 2 9.733 2 12.614 4.212 15 7 15s5-2.386 5-5.267c0-1.05-.368-2.169-.867-3.212-.671-1.402-1.616-2.744-2.385-3.727a29 29 0 0 0-1.354-1.605l-.022-.023-.006-.007-.002-.001zm0 0-.364-.343zm-.016.766L7 2.247l.016.019c.24.274.572.667.944 1.144.611.781 1.32 1.776 1.901 2.827H4.14c.58-1.051 1.29-2.046 1.9-2.827.373-.477.706-.87.945-1.144zM3 9.733c0-.755.244-1.612.638-2.496h6.724c.395.884.638 1.741.638 2.496C11 12.117 9.182 14 7 14s-4-1.883-4-4.267"/></svg>';
            case "M":
                return '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="color: #fff;" fill="currentColor" class="bi bi-cloud-lightning-rain" viewBox="0 0 16 16"><path d="M2.658 11.026a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m9.5 0a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m-7.5 1.5a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m9.5 0a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m-.753-8.499a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 10H13a3 3 0 0 0 .405-5.973M8.5 1a4 4 0 0 1 3.976 3.555.5.5 0 0 0 .5.445H13a2 2 0 0 1 0 4H3.5a2.5 2.5 0 1 1 .605-4.926.5.5 0 0 0 .596-.329A4 4 0 0 1 8.5 1M7.053 11.276A.5.5 0 0 1 7.5 11h1a.5.5 0 0 1 .474.658l-.28.842H9.5a.5.5 0 0 1 .39.812l-2 2.5a.5.5 0 0 1-.875-.433L7.36 14H6.5a.5.5 0 0 1-.447-.724z"/></svg>';
            default:
                return '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="color: #fff;" fill="currentColor" class="bi bi-cloud" viewBox="0 0 16 16"><path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/></svg>';
        }
    }

    function addItemHistory(item, type) {
        // Tạo phần tử nội dung chính
        if (type) {
            const element = $(
                '<div class="iconApp">' +
                '<div id="App' + item.CodeWorkStation + '" class="icon" style="background-color: #28a745 !important;">' +
                getIconWorkstation(item.workstationType) +
                '</div>' +
                '<div class="info-box-content" style="padding-right: 0">' +
                '<div class="d-flex justify-content-between">' +
                '<span class="app-text">' + item.CodeWorkStation + '</span>' +
                '<span class="app-text" style="padding-right: 0">' + item.date + '</span>' +
                '</div>' +
                '<span class="app-text-number" style="padding-right: 0">' + item.NameWorkStation + '</span>' +
                '</div>' +
                '</div>'
            );
            // Tạo phần tử bao bọc với nút X
            const totalElement = $(
                '<div style="padding-bottom: 13px; position: relative;" class="history-item" data-code="' + item.CodeWorkStation + '">' +
                '</div>'
            );

            // Thêm phần tử chính vào phần tử bao bọc
            totalElement.append(element);
            // Gắn sự kiện click cho phần tử chính
            element.on('click', function () {
                handleItemCategoryClick(item);
            });
            if (type == 'category') {
                historyListCategoryDetail.append(totalElement);
            } else {
                historyListCategoryAdd.append(totalElement);
            }
        } else {
            const element = $(
                '<div class="iconApp">' +
                '<div id="App' + item.CodeWorkStation + '" class="icon" style="background-color: #28a745 !important; display: block">' +
                    '<div id="Value' + item.CodeWorkStation + '" style="background-color: #1052e7; width: 70px; height: 20px;font-size: 12px;color: #fff; border-radius: 4px 4px 0 0;">0 mm</div>'+
                getIconWorkstation(item.workstationType) +
                '</div>' +
                '<div class="info-box-content" style="padding-right: 0">' +
                '<div class="d-flex justify-content-between">' +
                '<span class="app-text">' + item.CodeWorkStation + '</span>' +
                '<span class="app-text" style="padding-right: 0">' + item.date + '</span>' +
                '</div>' +
                '<span class="app-text-number" style="padding-right: 0">' + item.NameWorkStation + '</span>' +
                '</div>' +
                '</div>'
            );
            // Tạo phần tử bao bọc với nút X
            const totalElement = $(
                '<div style="padding-bottom: 13px; position: relative;" class="history-item" data-code="' + item.CodeWorkStation + '">' +
                '<div class="close-icon">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">' +
                '<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>' +
                '</svg>' +
                '</div>' +
                '</div>'
            );

            // Thêm phần tử chính vào phần tử bao bọc
            totalElement.append(element);

            // Gắn sự kiện click cho nút X
            totalElement.find('.close-icon').on('click', function (e) {
                e.stopPropagation(); // Ngăn chặn sự kiện click lan đến phần tử chính

                // Hiển thị popup xác nhận
                const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa trạm "${item.NameWorkStation} [${item.CodeWorkStation}]" không?`);
                if (confirmDelete) {
                    totalElement.remove(); // Xóa phần tử nếu người dùng chọn "Có"
                    historyItems = historyItems.filter(i => i.CodeWorkStation !== item.CodeWorkStation);
                    localStorage.setItem('dataHistory', JSON.stringify(historyItems));
                    toastr.success(`Trạm "${item.CodeWorkStation}" đã bị xóa!`);
                    if (historyItems.length == 0) {
                        showAddWorkStationButton(); // Ẩn nút nếu có ít nhất 1 phần tử
                    }
                }
            });

            // Gắn sự kiện click cho phần tử chính
            element.on('click', function () {
                handleItemClick(item);
            });

            // Thêm phần tử vào danh sách lịch sử

            historyListDetail.append(totalElement);
        }

    }

    $(document).ready(function () {
        $(".toggle-button").click(function () {
            // Lấy danh sách con gần nhất (nếu có)
            const childList = $(this).siblings(".child-list");

            // Toggle hiển thị/ẩn danh sách con
            childList.slideToggle(200);

            // Xoay icon mũi tên
            const arrowIcon = $(this).find(".arrow-icon");
            arrowIcon.toggleClass("expanded");

            if (arrowIcon.hasClass("expanded")) {
                arrowIcon.css("transform", "rotate(90deg)");
            } else {
                arrowIcon.css("transform", "rotate(0deg)");
            }
        });
    });

    function addItemCategory(item, type) {
        let element = ''
        for (let i = 0; i < item.itemCategory.length; i++) {
            element += '<li>' +
                '<div style="position: relative;" class="history-item" data-code="' + item.itemCategory[i].CodeWorkStation + '">' +
                '<div class="iconApp">' +
                '<div id="App' + item.itemCategory[i].CodeWorkStation + '" class="icon" style="background-color: #28a745 !important;">' +
                getIconWorkstation(item.itemCategory[i].workstationType) +
                '</div>' +
                '<div class="info-box-content" style="padding-right: 0">' +
                '<div class="d-flex justify-content-between">' +
                '<span class="app-text">' + item.itemCategory[i].CodeWorkStation + '</span>' +
                '<span class="app-text" style="padding-right: 0">' + item.itemCategory[i].date + '</span>' +
                '</div>' +
                '<span class="app-text-number" style="padding-right: 0">' + item.itemCategory[i].NameWorkStation + '</span>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</li>'
        }

        element += '<li>' +
            '<div  style="width: 100%;">' +
            '<button class="btnRemoveCategory btn btn-danger" style="width: 100%; height: 35px; color: #fff; padding: 3px 10px;">Xoá danh mục</button>' +
            '</div>' +
            '</li>'
        // Tạo phần tử bao bọc với nút X
        const totalElement = $(
            '<li class="parent-item">' +
            '<button class="toggle-button">' +
            '<div>' +
            '<h4 style="margin: 0;">' + item.NameCategory + '</h4>' +
            '<p style="margin: 10px 0 0 0; font-size: 14px; font-weight: 300;">Danh mục có ' + item.itemCategory.length + ' trạm</p>' +
            '</div>' +
            '<span class="arrow-icon">▶</span>' +
            '</button>' +
            '<ul class="child-list">' +
            element +
            '</ul>' +
            '</li>'
        );

        // Thêm phần tử chính vào phần tử bao bọc
        // totalElement.append(element);

        // Gắn sự kiện click cho nút X
        // totalElement.find('.close-icon').on('click', function (e) {
        //     e.stopPropagation(); // Ngăn chặn sự kiện click lan đến phần tử chính

        //     // Hiển thị popup xác nhận
        //     const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa danh mục "${item.NameCategory}" không?`);
        //     if (confirmDelete) {
        //         totalElement.remove(); // Xóa phần tử nếu người dùng chọn "Có"
        //         DataCategory = DataCategory.filter(i => i.NameCategory !== item.NameCategory);
        //         localStorage.setItem('dataCategory', JSON.stringify(DataCategory));
        //         toastr.success(`Danh mục "${item.NameCategory}" đã bị xóa!`);
        //         if (DataCategory.length == 0) {
        //             showAddCategoryButton();
        //         }
        //     }
        // }); 

        totalElement.find('.toggle-button').on('click', function (e) {
            e.preventDefault(); // Ngăn chặn hành động mặc định của thẻ <a>

            // Lấy danh sách con gần nhất (nếu có)
            const childList = $(this).siblings(".child-list");

            // Toggle hiển thị/ẩn danh sách con
            childList.slideToggle(200);

            // Xoay icon mũi tên
            const arrowIcon = $(this).find(".arrow-icon");
            arrowIcon.toggleClass("expanded");

            if (arrowIcon.hasClass("expanded")) {
                arrowIcon.css("transform", "rotate(90deg)");
            } else {
                arrowIcon.css("transform", "rotate(0deg)");
            }
        });

        totalElement.find('.btnRemoveCategory').on('click', function (e) {
            e.preventDefault(); // Ngăn chặn hành động mặc định của thẻ <a>
            const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa danh mục "${item.NameCategory}" không?`);
            if (confirmDelete) {
                totalElement.remove(); // Xóa phần tử nếu người dùng chọn "Có"
                DataCategory = DataCategory.filter(i => i.NameCategory !== item.NameCategory);
                localStorage.setItem('dataCategory', JSON.stringify(DataCategory));
                toastr.success(`Danh mục "${item.NameCategory}" đã bị xóa!`);
                if (DataCategory.length == 0) {
                    showAddCategoryButton();
                }
            }
        });

        // Gắn sự kiện click cho phần tử chính
        // element.on('click', function () {
        //     // handleItemClick(item);
        // });

        // Thêm phần tử vào danh sách lịch sử

        listCategory.append(totalElement);
    }
    function showAddCategoryButton() {
        const buttonHTML = $(
            '<div class="col-12" style="margin-top: 10px; display: flex; justify-content: center; align-items: center;">' +
            '<button id="addCategory" style="width: 200px; height: 200px; border-radius: 50%; border: 1px dashed #fff; background-color: #1E2833; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; font-size: 14px; text-align: center;">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" style="color: #fff; margin-bottom: 8px;" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">' +
            '<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>' +
            '</svg>' +
            'Tạo mới danh mục trạm.' +
            '</button>' +
            '</div>'
        );
        document.getElementById("btnAddCategory").classList.add("d-none");
        buttonHTML.on('click', function () {

            OpenAddCategory();
        });
        listCategory.append(buttonHTML);
    }

    function showAddWorkStationButton() {
        const buttonHTML = $(
            '<div style="margin-top: 10px; display: flex; justify-content: center; align-items: center;">' +
            '<button id="addWorkStation" style="width: 200px; height: 200px; border-radius: 50%; border: 1px dashed #fff; background-color: #1E2833; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; font-size: 14px; text-align: center;">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" style="color: #fff; margin-bottom: 8px;" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">' +
            '<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>' +
            '</svg>' +
            'Thêm mới' +
            '</button>' +
            '</div>'
        );
        buttonHTML.on('click', function () {
            if(checkTabHistory == 1){
                changeQRcode()
            } else if(checkTabHistory == 2){
                $(".WarrantyScanNext").click();
            }
        });
        historyListDetail.append(buttonHTML); // Giả sử bạn có một div với id "addWorkStationContainer" để chứa nút này
    }

    // click ở trang lịch sử để truy cập
    function handleItemClick(item) {
        stopInterval()
        localStorage.setItem("URL", "https://" + item.domain + "/Service/Service.svc");
        document.getElementById("footer-stationName").textContent = item.CodeWorkStation + " - " + item.NameWorkStation;
        localStorage.setItem("MATRAM", item.CodeWorkStation);
        const itemHistory = { 'CodeWorkStation': item.CodeWorkStation, 'NameWorkStation': item.NameWorkStation, 'domain': item.domain, 'date': getCurrentTime(), 'workstationType': item.workstationType }
        localStorage.setItem('itemHistory', JSON.stringify(itemHistory));
        $("#loading-popup").show()
        truyCap();
    }

    function handleItemCategoryClick(item) {
        const itemHistory = { 'CodeWorkStation': item.CodeWorkStation, 'NameWorkStation': item.NameWorkStation, 'domain': item.domain, 'date': getCurrentTime(), 'workstationType': item.workstationType }
        CategoryItems = JSON.parse(localStorage.getItem('listItemCategory'));
        let filterItem = []
        if (CategoryItems) {
            filterItem = CategoryItems.filter(itemdetail => itemdetail.CodeWorkStation === item.CodeWorkStation);
        }
        if (filterItem.length > 0) {
            CategoryItems = CategoryItems.filter(itemdetail => itemdetail.CodeWorkStation !== item.CodeWorkStation);
            localStorage.setItem('listItemCategory', JSON.stringify(CategoryItems));

            historyListCategoryAdd.empty();
            for (let i = CategoryItems.length - 1; i >= 0; i--) {
                addItemHistory(CategoryItems[i], 'add');
            }
        } else {
            if (CategoryItems) {
                CategoryItems = CategoryItems.filter(itemdetail => itemdetail.CodeWorkStation !== item.CodeWorkStation);
                CategoryItems.push(itemHistory);
                if (CategoryItems.length > 20) {
                    CategoryItems.shift();
                }
            } else {
                CategoryItems = [];
                CategoryItems.push(itemHistory);
            }
            localStorage.setItem('listItemCategory', JSON.stringify(CategoryItems));

            if (CategoryItems && CategoryItems.length > 0) {
                historyListCategoryAdd.empty();
                for (let i = CategoryItems.length - 1; i >= 0; i--) {
                    addItemHistory(CategoryItems[i], 'add');
                }
            }
        }
        showHistoryCategory()
    }

    var ZONE_PROPERTY;
    var ZONE_UNIT;
    // chạy Interval để check trạng thái hoạt động
    async function startInterval() {
        // Chạy setInterval nếu chưa chạy
        
        if (!intervalId) {
            ZONE_PROPERTY = 'RD';
            ZONE_UNIT = ' mm';
            for (let i = historyItems.length - 1; i >= 0; i--) {
                const data = await getNewData(
                    historyItems[i].CodeWorkStation,
                    "WORKSTATION_ID='" + historyItems[i].CodeWorkStation + "'",
                    "https://" + historyItems[i].domain + "/Service/Service.svc"
                );
                let filteredItems = data.D.filter(item => item.ZONE_ADDRESS === historyItems[i].CodeWorkStation);

                if (filteredItems.length != 0) {
                    if (historyItems[i].workstationType == "NAAM") {
                        const dataRD = filteredItems.filter(item => item.ZONE_PROPERTY === ZONE_PROPERTY);
                        if(dataRD.length != 0){
                            document.getElementById('Value' + historyItems[i].CodeWorkStation).textContent = dataRD[0].ZONE_VALUE/10 + ZONE_UNIT
                        }
                    } else if (historyItems[i].workstationType == "N") {
                        const dataRD = filteredItems.filter(item => item.ZONE_PROPERTY === 'RN');
                        if(dataRD.length != 0){
                            document.getElementById('Value' + historyItems[i].CodeWorkStation).textContent = dataRD[0].ZONE_VALUE + " cm"
                        }
                    } else if (historyItems[i].workstationType == "M") {
                        const dataRD = filteredItems.filter(item => item.ZONE_PROPERTY === 'RD');
                        if(dataRD.length != 0){
                            document.getElementById('Value' + historyItems[i].CodeWorkStation).textContent = dataRD[0].ZONE_VALUE/10 + " mm"
                        }
                    } else if (historyItems[i].workstationType == "MS") {
                        const dataRD = filteredItems.filter(item => item.ZONE_PROPERTY === 'RD');
                        if(dataRD.length != 0){
                            document.getElementById('Value' + historyItems[i].CodeWorkStation).textContent = dataRD[0].ZONE_VALUE/10 + " mm"
                        }
                    }
                    const now = new Date();
                    const dataRA = filteredItems.filter(item => item.ZONE_PROPERTY === 'RA');
                    const providedTime = new Date(dataRA[0].DATE_CREATE);
                    const differenceInMilliseconds = now.getTime() - providedTime.getTime();
                    const checkTimeOnline = differenceInMilliseconds / (1000 * 60)
                    if (checkTimeOnline < 15) {
                        const button = document.getElementById('App' + historyItems[i].CodeWorkStation);
                        if (button) {
                            button.style.backgroundColor = "#28a745";
                        }
                    } else {
                        const button = document.getElementById('App' + historyItems[i].CodeWorkStation);
                        if (button) {
                            button.style.backgroundColor = "#da4a58";
                        }
                    }
                } else {
                    const button = document.getElementById('App' + historyItems[i].CodeWorkStation);
                    if (button) {
                        button.style.backgroundColor = "#da4a58";
                    }
                }
            }
            intervalId = setInterval(async () => {
                if(ZONE_PROPERTY == 'RD'){
                    ZONE_PROPERTY = 'RT'
                    ZONE_UNIT = ' °C'
                } else if(ZONE_PROPERTY == 'RT'){
                    ZONE_PROPERTY = 'RH'
                    ZONE_UNIT = ' %'
                } else if(ZONE_PROPERTY == 'RH'){
                    ZONE_PROPERTY = 'RP'
                    ZONE_UNIT = ' hPa'
                } else if(ZONE_PROPERTY == 'RP'){
                    ZONE_PROPERTY = 'RD'
                    ZONE_UNIT = ' mm'
                }
                for (let i = historyItems.length - 1; i >= 0; i--) {
                    const data = await getNewData(
                        historyItems[i].CodeWorkStation,
                        "WORKSTATION_ID='" + historyItems[i].CodeWorkStation + "'",
                        "https://" + historyItems[i].domain + "/Service/Service.svc"
                    );
                    let filteredItems = data.D.filter(item => item.ZONE_ADDRESS === historyItems[i].CodeWorkStation);

                        if (filteredItems.length != 0) {
                            if (historyItems[i].workstationType == "NAAM") {
                            const dataRD = filteredItems.filter(item => item.ZONE_PROPERTY === ZONE_PROPERTY);
                            if(dataRD.length != 0){
                                document.getElementById('Value' + historyItems[i].CodeWorkStation).textContent = dataRD[0].ZONE_VALUE/10 + ZONE_UNIT
                            } else {
                                document.getElementById('Value' + historyItems[i].CodeWorkStation).textContent = '0 mm';
                            }
                        } else if (historyItems[i].workstationType == "N") {
                            const dataRD = filteredItems.filter(item => item.ZONE_PROPERTY === 'RN');
                            if(dataRD.length != 0){
                                document.getElementById('Value' + historyItems[i].CodeWorkStation).textContent = dataRD[0].ZONE_VALUE + " cm"
                            }
                        } else if (historyItems[i].workstationType == "M") {
                            const dataRD = filteredItems.filter(item => item.ZONE_PROPERTY === 'RD');
                            if(dataRD.length != 0){
                                document.getElementById('Value' + historyItems[i].CodeWorkStation).textContent = dataRD[0].ZONE_VALUE/10 + " mm"
                            }
                        } else if (historyItems[i].workstationType == "MS") {
                            const dataRD = filteredItems.filter(item => item.ZONE_PROPERTY === 'RD');
                            if(dataRD.length != 0){
                                document.getElementById('Value' + historyItems[i].CodeWorkStation).textContent = dataRD[0].ZONE_VALUE/10 + " mm"
                            }
                        }
                        const now = new Date();
                        const dataRA = filteredItems.filter(item => item.ZONE_PROPERTY === 'RA');
                        const providedTime = new Date(dataRA[0].DATE_CREATE);
                        const differenceInMilliseconds = now.getTime() - providedTime.getTime();
                        const checkTimeOnline = differenceInMilliseconds / (1000 * 60);
                        if (checkTimeOnline < 15) {
                            const button = document.getElementById('App' + historyItems[i].CodeWorkStation);
                            if (button) {
                                button.style.backgroundColor = "#28a745";
                            }
                        } else {
                            const button = document.getElementById('App' + historyItems[i].CodeWorkStation);
                            if (button) {
                                button.style.backgroundColor = "#da4a58";
                            }
                        }
                    } else {
                        const button = document.getElementById('App' + historyItems[i].CodeWorkStation);
                        if (button) {
                            button.style.backgroundColor = "#da4a58";
                        }
                    }
                }
            }, 10000);
        }
    }

    function stopInterval() {
        // Xóa interval nếu đang chạy
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    $('#search-category').on('change', function () {
        const searchValue = $(this).val().toLowerCase();
        showHistoryCategory(searchValue)
    });
    // hiển thị dữ liệu lịch sử truy cập 
    function showHistory(type) {
        if(type == "ADD"){
            document.getElementById("history-setting").classList.remove("d-none");
            document.getElementById("history-homePage").classList.add("d-none");
            OpenAddCategory()
        } else if(type == "WAR"){

        } else {
            historyItems = JSON.parse(localStorage.getItem('dataHistory'));
            DataCategory = JSON.parse(localStorage.getItem('dataCategory'));
            let arrayCategory = [];
            arrayCategory.push("ADD");
            if (DataCategory) {
                if (DataCategory.length > 0) {
                    for (let i = DataCategory.length - 1; i >= 0; i--) {
                        if (!arrayCategory.includes(DataCategory[i].NameCategory)) { // Kiểm tra nếu phần tử chưa có trong mảng
                            arrayCategory.push(DataCategory[i].NameCategory);
                        }
                    }
                }
            }
            if (type) {
                if (DataCategory) {
                    DataCategory = DataCategory.filter(item => item.NameCategory == type);
                } else {
                    DataCategory = []
                }
                if (type != "ALL" && DataCategory.length == 0) {
                    historyItems = historyItems.filter(item => item.workstationType === type);
                } else if (DataCategory) {
                    if (DataCategory.length > 0) {
                        let arrayWostation = [];
                        for (let i = DataCategory[0].itemCategory.length - 1; i >= 0; i--) {
                            const filterHistoryItems = historyItems.filter(item => item.CodeWorkStation === DataCategory[0].itemCategory[i].CodeWorkStation);
                            arrayWostation.push(filterHistoryItems[0]);
                        }
                        historyItems = arrayWostation;
                    }
                }
            }
            if (historyItems && historyItems.length > 0) {
                historyListDetail.empty();
                for (let i = historyItems.length - 1; i >= 0; i--) {
                    addItemHistory(historyItems[i]);
                    if (!arrayCategory.includes(historyItems[i].workstationType)) { // Kiểm tra nếu phần tử chưa có trong mảng
                        arrayCategory.push(historyItems[i].workstationType);
                    }
                }
                arrayCategory.push("ALL");
                if (!type) {
                    const selectElement = $('#historySelect');
                    selectElement.empty();
                    for (let i = arrayCategory.length - 1; i >= 0; i--) {
                        const selectElement = document.getElementById("historySelect");
                        const newOption = document.createElement("option");
                        let value;
                        let text;
                        if (arrayCategory[i] == "NAAM") {
                            value = arrayCategory[i]
                            text = "Trạm Mưa, nhiệt, ẩm, áp"
                        } else if (arrayCategory[i] == "N") {
                            value = arrayCategory[i]
                            text = "Trạm mực nước"
                        } else if (arrayCategory[i] == "M") {
                            value = arrayCategory[i]
                            text = "Trạm Mưa"
                        } else if (arrayCategory[i] == "MS") {
                            value = arrayCategory[i]
                            text = "Trạm Mưa, sóng"
                        } else if (arrayCategory[i] == "ALL") {
                            value = arrayCategory[i]
                            text = "Tất cả trạm"
                        } else if (arrayCategory[i] == "ADD") {
                            value = arrayCategory[i]
                            text = " + Thêm danh mục mới"
                            newOption.className = "custom-option";
                        } else {
                            value = arrayCategory[i]
                            text = arrayCategory[i]
                        }
                        newOption.value = value; // Giá trị mới
                        newOption.text = text; // Văn bản mới
                        selectElement.appendChild(newOption); // Thêm vào danh sách select
                    }
                }
                startInterval();
            }
        }
    }

    function showHistoryCategory(type) {
        historyItems = JSON.parse(localStorage.getItem('dataHistory'));
        CategoryItems = JSON.parse(localStorage.getItem('listItemCategory'));
        if (type) {
            historyItems = historyItems.filter(item =>
                item.CodeWorkStation.includes(type) ||
                item.NameWorkStation.toLowerCase().includes(type)
            );
        }
        if (CategoryItems) {
            for (let i = 0; i < CategoryItems.length; i++) {
                historyItems = historyItems.filter(item => item.CodeWorkStation != CategoryItems[i].CodeWorkStation);
            }
        }
        if (historyItems) {
            historyListCategoryDetail.empty();
            for (let i = historyItems.length - 1; i >= 0; i--) {
                addItemHistory(historyItems[i], 'category');
            }
        }
    }

    function showCategory(type) {
        DataCategory = JSON.parse(localStorage.getItem('dataCategory'));
        if (DataCategory) {
            if (DataCategory.length > 0) {
                document.getElementById("btnAddCategory").classList.remove("d-none");
                listCategory.empty();
                for (let i = DataCategory.length - 1; i >= 0; i--) {
                    addItemCategory(DataCategory[i], 'category');
                }
            }
        }
    }
    // lưu lịch sử
    function saveHistory(code) {
        historyItems = JSON.parse(localStorage.getItem('dataHistory'));
        if (historyItems) {
            historyItems = historyItems.filter(item => item.CodeWorkStation !== code);
            const item = JSON.parse(localStorage.getItem('itemHistory'));
            historyItems.push(item);
            if (historyItems.length > 20) {
                historyItems.shift();
            }
        } else {
            historyItems = [];
            const item = JSON.parse(localStorage.getItem('itemHistory'));
            historyItems.push(item);
        }

        localStorage.setItem('dataHistory', JSON.stringify(historyItems));
    }

    function saveCategory() {
        const inputValue = $('#name-category').val();
        if (inputValue) {
            const item = JSON.parse(localStorage.getItem('listItemCategory'));
            let itemCategory = { 'NameCategory': inputValue, 'itemCategory': item }
            DataCategory = JSON.parse(localStorage.getItem('dataCategory'));
            if (DataCategory) {
                const checkInput = DataCategory.filter(item => item.NameCategory === inputValue);
                if (checkInput.length > 0) {
                    const confirmEDIT = confirm(`Danh mục "${inputValue}" đã tồn tại, xác nhận có muốn thêm những trạm đã chọn chưa nằm trong danh mục hay không?`);
                    if(confirmEDIT){
                        itemCategory.itemCategory.forEach(item2 => {
                            const exists = checkInput[0].itemCategory.some(item1 => item1.CodeWorkStation === item2.CodeWorkStation);
                            if (!exists) {
                                checkInput[0].itemCategory.push(item2);
                            }
                        });
                        DataCategory = DataCategory.filter(item => item.NameCategory !== inputValue);
                        DataCategory.push(checkInput[0]);
                        localStorage.setItem('dataCategory', JSON.stringify(DataCategory));
                        document.getElementById("list-category").classList.remove("d-none");
                        document.getElementById("save-category").classList.add("d-none");
                        $('#name-category').val('');
                        $('#search-category').val('');
                        localStorage.setItem('listItemCategory', JSON.stringify([]));
                        historyListCategoryAdd.empty();
                        showCategory()
                    }
                } else if (item.length == 0) {
                    toastr.error("Vui lòng chọn trạm để thêm vào danh mục!");
                } else {
                    if (DataCategory) {
                        DataCategory.push(itemCategory);
                        if (DataCategory.length > 20) {
                            DataCategory.shift();
                        }
                    } else {
                        DataCategory = [];
                        DataCategory.push(itemCategory);
                    }
                    localStorage.setItem('dataCategory', JSON.stringify(DataCategory));
                    document.getElementById("list-category").classList.remove("d-none");
                    document.getElementById("save-category").classList.add("d-none");
                    $('#name-category').val('');
                    $('#search-category').val('');
                    localStorage.setItem('listItemCategory', JSON.stringify([]));
                    historyListCategoryAdd.empty();
                    showCategory()
                }
            } else {
                DataCategory = [];
                DataCategory.push(itemCategory);
                localStorage.setItem('dataCategory', JSON.stringify(DataCategory));
                document.getElementById("list-category").classList.remove("d-none");
                document.getElementById("save-category").classList.add("d-none");
                $('#name-category').val('');
                $('#search-category').val('');
                localStorage.setItem('listItemCategory', JSON.stringify([]));
                historyListCategoryAdd.empty();
                showCategory()
            }

        } else {
            toastr.error("Vui lòng nhập tên danh mục!");
        }
    }
    
    function saveWarranty(data) {
        console.log(data);
        const DataQRcode = data[0].QR_CODE.split(',');
        const itemW = { 
            'CodeWarranty': DataQRcode[2].substring(1), 
            'NameWarranty': data[0].PRODUCT_NAME, 
            'imgWarranty': data[0].PRODUCT_IMG,
            'date': getCurrentTime()
        }
        
        waranntyItems = JSON.parse(localStorage.getItem('dataWarranty'));
        console.log(waranntyItems, itemW.CodeWarranty);
        
        if (waranntyItems) {
            waranntyItems = waranntyItems.filter(item => item.CodeWarranty !== itemW.CodeWarranty);
            waranntyItems.push(itemW);
            if (waranntyItems.length > 20) {
                waranntyItems.shift();
            }
        } else {
            waranntyItems = [];
            waranntyItems.push(itemW);
        }

        localStorage.setItem('dataWarranty', JSON.stringify(waranntyItems));
    }
    
    // update data của trang chính xem dữ liệu
    function changeDataHomePage(data) {
        if (data != [] && data != null && data != '') {
            let checkRD = false;
            let checkRT = false;
            let filteredItems = data.filter(item => item.ZONE_ADDRESS === localStorage.getItem('MATRAM'));
            console.log(filteredItems);
            
            for (let i = 0; i < filteredItems.length; i++) {
                if (filteredItems[i].ZONE_PROPERTY == "RT") {
                    checkRT = true;
                    document.getElementById("RT").textContent = filteredItems[i].ZONE_VALUE / 10 + " °C";
                    setRangeValue(filteredItems[i].ZONE_VALUE / 10, "success")
                } else if (filteredItems[i].ZONE_PROPERTY == "RH") {
                    document.getElementById("RH").textContent = filteredItems[i].ZONE_VALUE / 10 + " %";
                } else if (filteredItems[i].ZONE_PROPERTY == "RA") {
                    document.getElementById("energy").textContent = filteredItems[i].ZONE_VALUE / 10 + " V";
                    // updateProgressBar("acQuy-bar",0, 50, filteredItems[i].ZONE_VALUE / 10, "v")
                    getCurrentTime(filteredItems[i].DATE_CREATE);
                    const now = new Date();
                    const providedTime = new Date(filteredItems[i].DATE_CREATE);
                    const differenceInMilliseconds = now.getTime() - providedTime.getTime();
                    const checkTimeOnline = differenceInMilliseconds / (1000 * 60)
                    if (checkTimeOnline < 15) {
                        document.getElementById("status").style.background = "green";
                        document.getElementById("text-status").textContent = "Đang hoạt động";
                        document.getElementById("status").classList.add('blinking'); // Thêm class nhấp nháy

                        // Dừng nhấp nháy sau 3 giây
                        setTimeout(() => {
                            document.getElementById("status").classList.remove('blinking'); // Xóa class nhấp nháy
                        }, 3000);
                    } else {
                        document.getElementById("status").style.background = "red";
                        document.getElementById("text-status").textContent = "Ngừng hoạt động";
                    }
                    // document.getElementById("RA").textContent = filteredItems[i].ZONE_VALUE / 10 ;
                } else if (filteredItems[i].ZONE_PROPERTY == "RP") {
                    document.getElementById("RP").textContent = filteredItems[i].ZONE_VALUE / 10 + " hPa";
                } else if (filteredItems[i].ZONE_PROPERTY == "RD") {
                    checkRD = true;
                    document.getElementById("RD").textContent = filteredItems[i].ZONE_VALUE / 10 + " mm ";
                    document.getElementById("glass").style.background = "url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/54046/glass_droplets.jpeg) center center / cover no-repeat";
                    document.getElementById("lastTimeRain").textContent = " ("+getCurrentTime(filteredItems[i].DATE_CREATE).substring(11)+")";
                    // const color = getColor(filteredItems[i].ZONE_VALUE / 10);
                    // changeColorAndText(color, color, filteredItems[i].ZONE_VALUE / 10);
                    // updateProgressBar("rain-bar", -500, 500, (filteredItems[i].LAST_VALUE / 10), "mm");
                } else if (filteredItems[i].ZONE_PROPERTY == "RN") {
                    checkRD = true;
                    document.getElementById("RN").textContent = filteredItems[i].ZONE_VALUE + " cm";
                }
                if (checkRT == false) {
                    setRangeValue(0)
                }
                if (checkRD == false) {
                    const now = new Date();
                    const hours = String(now.getHours()).padStart(2, '0');
                    if(hours < 18 && hours > 6){
                        document.getElementById("glass").style.background = "url(https://i.pinimg.com/736x/9d/1e/b3/9d1eb31563d0694c0eccd2724b5410a9.jpg) center center / cover no-repeat";
                    } else {
                        document.getElementById("landscape").classList.add("d-none");
                        document.getElementById("glass").style.background = "url(https://i.pinimg.com/736x/43/d4/5d/43d45ddb855463920c7505f846bf2900.jpg) center center / cover no-repeat";
                    }
                    
                }
            }
        } else {
            const path = document.querySelector("#mySvg path");
            path.setAttribute("fill", "#007bff");
        }
        $('#loading-popup').hide()
    }

    if (maTram != "") {
        getDataMonitoring();
        document.getElementById("ScanQR").classList.add("hidden");
        document.getElementById("homePage").classList.remove("hidden");
    }

    function formatDateTime(date) {
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
    var checkCam = true;
    // call api getnewdata lấy data mới nhất
    function getNewData(workstation, c, url) {
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

    function getDayMessage(type) {
        switch (type) {
            case "NAAM":
                return 'RD-RT-RH-RP';
            case "N":
                return 'RN---';
            case "M":
                return 'RD---';
            case "MS":
                return 'RD---';
            default:
                return "";
        }
    }

    // lọc theo ngày, tháng, năm
    async function clickGetData(type) {
        if (lineBarChart != null) {
            lineBarChart.destroy();
            document.getElementById("loading-spinner").classList.remove("d-none");
        }
        const item = JSON.parse(localStorage.getItem('itemHistory'));
        const TypeWorkstation = getDayMessage(item.workstationType);

        if (type == 'NGAY') {
            const dataChart = await getDataChart('NGAY', '', '', TypeWorkstation, localStorage.getItem("MATRAM"), localStorage.getItem("URL"));

            if (dataChart != []) {
                createChartData(dataChart, 'RD', type)
            }
        } else if (type == 'TUAN') {
            const dataChart = await getDataChart('TUAN', '', '', TypeWorkstation, localStorage.getItem("MATRAM"), localStorage.getItem("URL"));
            if (dataChart != []) {
                createChartData(dataChart, 'RD', type)
            }
        } else if (type == 'THANG') {
            const dataChart = await getDataChart('THANG', '', '', TypeWorkstation, localStorage.getItem("MATRAM"), localStorage.getItem("URL"));
            if (dataChart != []) {
                createChartData(dataChart, 'RD', type)
            }
        } else if (type == 'NAM') {
            const dataChart = await getDataChart('NAM', '2024-01-01 16$50$08', '2024-12-30 16$50$08', TypeWorkstation, localStorage.getItem("MATRAM"), localStorage.getItem("URL"));
            if (dataChart != []) {
                createChartData(dataChart, 'RD', type)
            }
        }
    }
    //call api GetDataWorkStation lấy dữ liệu của WorkStation được chỉ định
    function getDataStation(workstationID, domain) {

        return new Promise((resolve, reject) => {
            $.ajax({
                url: "https://" + domain + "/Service/Service.svc/ApiServicePublic/" + "GetDataWorkStation" + "/" + "WORKSTATION_ID='" + workstationID + "'",
                type: "GET",
                dataType: "jsonp",
                contentType: "application/json; charset=utf-8",
                success: function (msg) {
                    try {
                        let state = JSON.parse(msg);
                        if (state != [] && state != "" && state != null && state.length != 0 && state.length != undefined) {
                            const item = { 'CodeWorkStation': workstationID, 'NameWorkStation': state[0].WORKSTATION_NAME, 'domain': domain, 'date': getCurrentTime(), 'workstationType': state[0].TEMPLATE_TOOLTIP }
                            localStorage.setItem('itemHistory', JSON.stringify(item));
                        }
                        resolve(state); // Trả về dữ liệu khi thành công
                    } catch (error) {
                        reject(error); // Bắt lỗi nếu JSON parse thất bại
                    }
                },
                complete: function (data) {
                    // Có thể thêm xử lý khi request hoàn thành ở đây nếu cần
                },
                error: function (e, t, x) {
                    // document.getElementById("result-form").classList.remove("d-none");
                    // document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
                    // toastr.error("Vui lòng quét đúng mã QR của trạm mưa");
                },
            });
        });

    }

    //call api GetDataFilterLogzone
    function getDataChart(typeTime, start, end, type, zone, url) {

        const Url = "https://DEV.HOMEOS.vn/service/service.svc/";

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

    function checkTypeWorkstation() {
        document.getElementById("box-RT").classList.add("d-none");
        document.getElementById("box-RH").classList.add("d-none");
        document.getElementById("box-RD").classList.add("d-none");
        document.getElementById("box-RD").classList.add("col-6");
        document.getElementById("box-RD").classList.remove("col-12");
        document.getElementById("box-RP").classList.add("d-none");
        document.getElementById("box-RN").classList.add("d-none");
        document.getElementById("box-RN").classList.add("col-6");
        document.getElementById("box-RN").classList.remove("col-12");
        document.getElementById("chart-RT").classList.add("d-none");
        document.getElementById("chart-RH").classList.add("d-none");
        document.getElementById("chart-RD").classList.add("d-none");
        document.getElementById("chart-RP").classList.add("d-none");
        document.getElementById("chart-RN").classList.add("d-none");
        const item = JSON.parse(localStorage.getItem('itemHistory'));
        if (item.workstationType == "NAAM") {
            document.getElementById("box-RT").classList.remove("d-none");
            document.getElementById("box-RH").classList.remove("d-none");
            document.getElementById("box-RD").classList.remove("d-none");
            document.getElementById("box-RP").classList.remove("d-none");
            document.getElementById("chart-RT").classList.remove("d-none");
            document.getElementById("chart-RH").classList.remove("d-none");
            document.getElementById("chart-RD").classList.remove("d-none");
            document.getElementById("chart-RP").classList.remove("d-none");
        } else if (item.workstationType == "N") {
            document.getElementById("box-RN").classList.remove("d-none");
            document.getElementById("chart-RN").classList.remove("d-none");
            document.getElementById("box-RN").classList.remove("col-6");
            document.getElementById("box-RN").classList.add("col-12");
        } else if (item.workstationType == "M" || item.workstationType == "MS") {
            document.getElementById("box-RD").classList.remove("d-none");
            document.getElementById("chart-RD").classList.remove("d-none");
            document.getElementById("box-RD").classList.remove("col-6");
            document.getElementById("box-RD").classList.add("col-12");
        }
    }
    var ctx = document.getElementById("lineBarChart");
    var lineBarChart;
    var ctx_RT = document.getElementById("ChartRT");
    var ChartRT;
    var ctx_RH = document.getElementById("ChartRH");
    var ChartRH;
    var ctx_RP = document.getElementById("ChartRP");
    var ChartRP;
    var ctx_RN = document.getElementById("ChartRN");
    var ChartRN;
    // khởi Tạo biểu đồ
    // ctx.getContext("2d");
    function createNewChart() {
        if (lineBarChart != null) {
            lineBarChart.destroy();
        }
        lineBarChart = new Chart(ctx, {
            type: "bar", // Chọn loại biểu đồ chính là bar
            data: {
                labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [
                    {
                        type: "bar", // Chọn kiểu bar cho dataset này
                        label: "Lượng bán hàng",
                        data: [30, 50, 40, 60, 70, 45, 80],
                        backgroundColor: "rgba(75, 192, 192, 0.5)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                    {
                        type: "line", // Chọn kiểu line cho dataset này
                        label: "Doanh thu",
                        data: [300, 400, 350, 450, 500, 400, 550],
                        backgroundColor: "rgba(255, 99, 132, 0.2)",
                        borderColor: "rgba(255, 99, 132, 1)",
                        fill: false, // Không tô nền dưới đường
                        tension: 0.3, // Tạo độ cong cho đường
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true, // Đảm bảo trục Y bắt đầu từ 0
                    },
                },
            },
        });
    }

    function roundToTwoDecimals(num) {
        if (Number.isInteger(num)) {
            return num; // Nếu là số nguyên thì trả về nguyên gốc
        }
        return Math.round(num * 100) / 100; // Làm tròn đến 2 chữ số thập phân
    }
    // lọc data để tạo chart
    createChartData = function (data, type, typeData) {
        if (lineBarChart != null) {
            lineBarChart.destroy();
        }
        if (ChartRT != null) {
            ChartRT.destroy();
        }
        if (ChartRH != null) {
            ChartRH.destroy();
        }
        if (ChartRP != null) {
            ChartRP.destroy();
        }
        if (ChartRN != null) {
            ChartRN.destroy();
        }
        var RA = ctx.getContext('2d');
        var RT = ctx_RT.getContext('2d');
        var RH = ctx_RH.getContext('2d');
        var RP = ctx_RP.getContext('2d');
        var RN = ctx_RN.getContext('2d');
        let newDataRA = [];
        let newlabelRA = [];
        let newDataRT = [];
        let newlabelRT = [];
        let newDataRH = [];
        let newlabelRH = [];
        let newDataRP = [];
        let newlabelRP = [];
        let newDataRN = [];
        let newlabelRN = [];
        $.each(data, function (i, item) {
            //if (item.AverageValue != 0) {
                if (item.ZONE_PROPERTY == 'RD') {
                    newlabelRA.push(item.Label);
                    const value = roundToTwoDecimals(item.AverageValue / 10)
                    newDataRA.push(value)
                } else if (item.AverageValue != 0) {
                    if (item.ZONE_PROPERTY == 'RT') {
                        newlabelRT.push(item.Label);
                        const value = roundToTwoDecimals(item.AverageValue / 10)
                        newDataRT.push(value.toFixed(2))
                    } else if (item.ZONE_PROPERTY == 'RH') {
                        newlabelRH.push(item.Label);
                        const value = roundToTwoDecimals(item.AverageValue / 10)
                        newDataRH.push(value.toFixed(2))
                    } else if (item.ZONE_PROPERTY == 'RP') {
                        newlabelRP.push(item.Label);
                        const value = roundToTwoDecimals(item.AverageValue / 10)
                        newDataRP.push(value.toFixed(2))
                    } else if (item.ZONE_PROPERTY == 'RN') {
                        newlabelRN.push(item.Label);
                        const value = roundToTwoDecimals(item.AverageValue)
                        newDataRN.push(value.toFixed(2))
                    }
                }
                

            //}
        })
        var dataSetRA = [
            {
                type: "bar", // Chọn kiểu bar cho dataset này
                label: "Lượng mưa (mm)",
                data: newDataRA,
                backgroundColor: "rgba(75, 192, 192, 0.5)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            }
        ]
        var dataSetRP = [
            {
                type: "line", // Chọn kiểu bar cho dataset này
                label: "Áp suất (hPa)",
                data: newDataRP,
                backgroundColor: "rgb(40, 167, 69)",
                borderColor: "rgb(40, 167, 69)",
                borderDash: [5, 5],
                borderWidth: 1,
            }
        ]
        var dataSetRT = [
            {
                type: "line", // Chọn kiểu bar cho dataset này
                label: "Nhiệt độ (°C)",
                data: newDataRT,
                backgroundColor: "rgb(173 14 14)",
                borderColor: "rgb(173 14 14)",
                borderWidth: 1,
                // fill: 'start',
                tension: 0.4,
            }
        ]
        var dataSetRH = [
            {
                type: "line", // Chọn kiểu bar cho dataset này
                label: "Độ ẩm (%)",
                data: newDataRH,
                backgroundColor: "rgb(13,154,154, 0.5)",
                borderColor: "rgb(13,154,154)",
                borderWidth: 1,
                fill: 'start',
                tension: 0.4,
            }
        ]
        var dataSetRN = [
            {
                type: "line", // Chọn kiểu bar cho dataset này
                label: "Mực nước (cm)",
                data: newDataRN,
                backgroundColor: "rgb(0,95,95, 0.5)",
                borderColor: "rgb(13,154,154)",
                borderWidth: 1,
                fill: 'start',
                tension: 0.4,
            }
        ]
        var label = '';
        if (typeData == 'NGAY') {
            label = "giờ"
        }
        lineBarChart = new Chart(RA, createChart("bar", newlabelRA, [], "mm", "", dataSetRA, label));
        ChartRT = new Chart(RT, createChart("bar", newlabelRT, [], "°C", "", dataSetRT, label));
        ChartRH = new Chart(RH, createChart("bar", newlabelRH, [], "%", "", dataSetRH, label, 0, 100));
        ChartRP = new Chart(RP, createChart("bar", newlabelRP, [], "hPa", "", dataSetRP, label));
        ChartRN = new Chart(RN, createChart("bar", newlabelRN, [], "cm", "", dataSetRN, label));
        document.getElementById("loading-spinner").classList.add("d-none");
    }

    // hàm để tạo chart
    createChart = function (type, Label, Data, Unit, LabelData, dataSet, labelNgay, Min, Max) {
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

    //qrcode
    var html5QrCode;
    var currentCameraIndex = 0;  // Index camera hiện tại
    var devices = [];  // Danh sách các camera
    var isScannerRunning = false;  // Biến theo dõi trạng thái quét
    var currentCamera;
    // Hàm khởi tạo quét QR
    // function startScan(cameraId, cam) {
    //     currentCamera = cam;
    //     const formatsToSupport = [
    //         Html5QrcodeSupportedFormats.QR_CODE,
    //         Html5QrcodeSupportedFormats.UPC_A,
    //         Html5QrcodeSupportedFormats.UPC_E,
    //         Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
    //     ];

    //     const config = {
    //         fps: 30,
    //         qrbox: 150,
    //         rememberLastUsedCamera: true,
    //         aspectRatio: 2,
    //         experimentalFeatures: {
    //             useBarCodeDetectorIfSupported: false
    //         },
    //         formatsToSupport: formatsToSupport
    //     };

    //     const cameraMode = {
    //         facingMode: { exact: cam }
    //     };

    //     html5QrCode = new Html5Qrcode("qr-reader");
    //     html5QrCode.start(
    //         cameraMode,
    //         config,
    //         qrCodeMessage => {
    //             stockitProcessQrCode(qrCodeMessage);
    //         },
    //         errorMessage => {
    //             // parse error, ignore it.
    //             // console.log("Error Message:", errorMessage);
    //         },
    //         onScanSuccess,
    //         onScanFailure
    //     ).then(() => {
    //         isScannerRunning = true;  // Đánh dấu scanner đang chạy
    //     }).catch(err => {
    //         console.error("Lỗi khi khởi động camera: ", err);
    //     });
    // }

    async function startScan(cameraId, cam) {
        currentCamera = cam;
        html5QrCode = new Html5Qrcode("qr-reader");
        html5QrCode.start(
            cameraId,
            {
                fps: 30,    // Số khung hình trên giây
                qrbox: { width: 250, height: 250 },  // Kích thước khung quét QR
                aspectRatio: 1.7, // Đặt tỉ lệ khung hình
                videoConstraints: {
                    // width: { ideal: 3840 }, // Độ phân giải video 4k
                    // height: { ideal: 2160 },
                    width: { ideal: 1920 }, // Độ phân giải video 1080p
                    height: { ideal: 1080 },
                    // width: { ideal: 2560 }, // Độ phân giải video 2k 
                    // height: { ideal: 1440 },
                    facingMode: { exact: cam },
                    advanced: [{ zoom: 2 }]
                }
            },
            onScanSuccess,
            onScanFailure
        ).then(() => {
            isScannerRunning = true;  // Đánh dấu scanner đang chạy
            setTimeout(() => {
                if(typeQR == 1){
                    $('#qr-shaded-region').css('border-width', '35vh 10vh');
                    // $('#qr-shaded-region').attr('style', 'border-width: 35vh 10vh !important;');
                } else {
                    $('#qr-shaded-region').css('border-width', '36vh 13vh');
                    // $('#qr-shaded-region').attr('style', 'border-width: 40vh 15vh !important;');
                }
            }, 100);
        }).catch(err => {
            console.error("Lỗi khi khởi động camera: ", err);
        });
        
    }

    // Khi nhấn nút mở popup quét QR
    function startQRcode() {
        document.getElementById("result-form-total").classList.add("d-none");
        document.getElementById("result-form-loading").classList.remove("d-none");
        document.getElementById("result-form-title").classList.add("d-none");
        document.getElementById("result-form-stationID").classList.remove("d-none");
        document.getElementById("result-form-stationName").classList.remove("d-none");
        $("#qr-popup").show();

        // Lấy danh sách camera và bắt đầu quét
        Html5Qrcode.getCameras().then(_devices => {
            devices = _devices; // Lưu lại danh sách camera
            if (devices && devices.length) {
                if (devices.length == 1) {
                    startScan(devices[currentCameraIndex].id, "user");  // Bắt đầu quét với camera đầu tiên
                } else {
                    startScan(devices[currentCameraIndex].id, "environment");
                }
            } else {
                console.error("Không tìm thấy thiết bị camera nào.");
            }
        }).catch(err => {
            console.error("Lỗi khi lấy danh sách camera: ", err);
        });
    };

    // Chuyển đổi camera
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

    // Khi nhấn nút đóng popup
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

    // Hàm xử lý khi quét thành công
    async function onScanSuccess(decodedText, decodedResult) {
        // Hiển thị kết quả trên trang chính
        //$("#result").text("Kết quả quét: " + decodedText);

        html5QrCode.stop().then(ignore => {
            isScannerRunning = false;  // Đánh dấu scanner đã dừng
            document.getElementById("result-form").classList.remove("d-none");
            document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
        }).catch(err => {
            console.error("Lỗi khi dừng camera sau khi quét thành công: ", err);
        });
        let data;
        let domain;
        let workstation;
        let checkQRcode = decodedText.split(',');
        if(typeQR == 2 || typeQR == 3){
            data = await getDataMDQRcode(decodedText.replaceAll(',', '$'));  
            if(data.length > 0){
                if(checkTab){
                    if(data[0].LOT_ID == 0){
                        const dataQRCODE = await getDM("DM_QRCODE", "LOT_ID='"+$('#lot-number').val()+"' AND LOT_CLASS='"+$('#classProduct').val()+"'")
                        if(dataQRCODE.data.length < $('#classProductNumber').val()){
                            const willInsertData = {
                                PR_KEY: data[0].PR_KEY,
                                QR_CODE: decodedText,
                                MA_SAN_PHAM: checkQRcode[1],
                                LOT_ID: $('#lot-number').val(),
                                LOT_CLASS: $('#classProduct').val(),
                                DATE_CREATE: new Date(),
                                ACTIVATE_WARRANTY: new Date('1999-01-01 07:00:00.000'),
                                USER_ID: UserID,
                                DATASTATE: "EDIT",
                            };
                            add('DM_QRCODE', willInsertData);
                            toastr.success("Quét QR và lưu thông tin thành công!");
                        } else {
                            toastr.error("Lớp đã quét đủ vui lòng nhập lớp mới!");
                        }
                    } else {
                        if(data[0].LOT_ID == $('#lot-number').val()){
                            toastr.error("Sản phẩm đã tồn tại trong lô này!");
                        } else {
                            toastr.error("Sản phẩm đã thuộc 1 lô khác, vui lòng kiểm tra lại!");
                        }
                    }
                    scanAgain();
                } else {
                    document.getElementById("result-product").classList.remove("d-none");
                    document.getElementById("result-form-loading").classList.add("d-none");
                    document.getElementById("result-form").classList.remove("d-none");
                    document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
                    document.getElementById("result-product-truycap").disabled = false;
                    document.getElementById("result-form-productName").value = checkQRcode[1];
                    document.getElementById("result-form-productCode").value = checkQRcode[2].substring(1);
                    document.getElementById("header-productName").textContent = checkQRcode[1]+" - "+checkQRcode[2].substring(1);
                    changeDataWarranty(data);
                }
                
            } else {
                if(typeQR == 3 && checkQRcode[0].substring(0, 3) == "T20"){
                    const dataQRCODE = await getDM("DM_QRCODE", "LOT_ID='"+$('#lot-number').val()+"' AND LOT_CLASS='"+$('#classProduct').val()+"'")
                    if(dataQRCODE.data.length < $('#classProductNumber').val()){
                        const willInsertData = {
                            QR_CODE: decodedText,
                            MA_SAN_PHAM: checkQRcode[1],
                            LOT_ID: $('#lot-number').val(),
                            LOT_CLASS: $('#classProduct').val(),
                            DATE_CREATE: new Date(),
                            ACTIVATE_WARRANTY: new Date('1999-01-01 07:00:00.000'),
                            USER_ID: UserID,
                            DATASTATE: "ADD",
                        };
                        await add('DM_QRCODE', willInsertData).then(async data => {
                            try {
                                toastr.success("Quét QR và lưu thông tin thành công!");
                                const dataEdit = await getDataMDQRcode(decodedText.replaceAll(',', '$'));
                                const willInsert = {
                                    TYPE: "ADD",
                                    ERROR_NAME: "Hoàn thành sản phẩm",
                                    DESCRIPTION: "Nhập sản phẩm vào hệ thống",
                                    DATE_CREATE: new Date(),
                                    ERROR_STATUS: 0,
                                    QRCODE_ID: dataEdit[0].PR_KEY,
                                    USER_ID: UserID,
                                    DATASTATE: "ADD",
                                };
                                await add('WARRANTY_ERROR', willInsert)
                                scanAgain();
                            } catch (e) { }
                        }).catch(err => {
                            console.error('Error:', err);
                        });
                        
                    } else {
                        toastr.error("Lớp đã quét đủ vui lòng nhập lớp mới!");
                        scanAgain();
                    }
                } else {
                    const dataLot = await getDM("WARRANTY_LOT", "1=1")
                    console.log();
                    const checkValue = dataLot.data.some(item => item.LOT_NUMBER == decodedText);
                    if(checkValue){
                        console.log(decodedText);
                    } else if(checkQRcode[0].substring(0, 3) == "T20") {
                        const willInsertData = {
                            QR_CODE: decodedText,
                            MA_SAN_PHAM: checkQRcode[1],
                            DATE_CREATE: new Date(),
                            ACTIVATE_WARRANTY: new Date('1999-01-01 07:00:00.000'),
                            USER_ID: UserID,
                            DATASTATE: "ADD",
                        };
                        add('DM_QRCODE', willInsertData).then(async data => {
                            try {
                                toastr.success("Quét QR và lưu thông tin thành công!");
                                if(checkTab){
                                    scanAgain();
                                } else {
                                    document.getElementById("result-product").classList.remove("d-none");
                                    document.getElementById("result-form-loading").classList.add("d-none");
                                    document.getElementById("result-form").classList.remove("d-none");
                                    document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
                                    document.getElementById("result-product-truycap").disabled = false;
                                    document.getElementById("result-form-productName").value = checkQRcode[1];
                                    document.getElementById("result-form-productCode").value = checkQRcode[2].substring(1);
                                    document.getElementById("header-productName").textContent = checkQRcode[1]+" - "+checkQRcode[2].substring(1);
                                    data = await getDataMDQRcode(decodedText.replaceAll(',', '$'));  
                                    const willInsertData = {
                                        TYPE: "ADD",
                                        ERROR_NAME: "Hoàn thành sản phẩm",
                                        DESCRIPTION: "Nhập sản phẩm vào hệ thống",
                                        DATE_CREATE: new Date(),
                                        ERROR_STATUS: 0,
                                        QRCODE_ID: data[0].PR_KEY,
                                        USER_ID: UserID,
                                        DATASTATE: "ADD",
                                    };
                                    await add('WARRANTY_ERROR', willInsertData)
                                    changeDataWarranty(data);
                                }
                            } catch (e) { }
                        }).catch(err => {
                            console.error('Error:', err);
                        });
                    } else {
                        document.getElementById("result-form").classList.remove("d-none");
                        document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
                        document.getElementById("result-form-total").classList.remove("d-none");
                        document.getElementById("result-form-loading").classList.add("d-none");
                        document.getElementById("result-form-title").classList.remove("d-none");
                        document.getElementById("result-form-stationID").classList.add("d-none");
                        document.getElementById("result-form-stationName").classList.add("d-none");
                        document.getElementById("result-truycap").classList.add("d-none");
                        toastr.error("Vui lòng quét đúng mã QR!");
                    }
                } 
                
            }
        } else {
            if (decodedText.length > 6) {
                var resultArray = decodedText.split("$");
                data = await getNewData(
                    localStorage.getItem("MATRAM"),
                    "WORKSTATION_ID='" + resultArray[1] + "'",
                    resultArray[0]
                );
                localStorage.setItem("URL", resultArray[0]);
                workstation = resultArray[1];
                document.getElementById("result-form-total").classList.remove("d-none");
                document.getElementById("result-form-loading").classList.add("d-none");
                document.getElementById("result-form").classList.remove("d-none");
                document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
            } else if (decodedText.length == 6) {
                domain = await getDomain(decodedText, 'domain');
                const url = "https://" + domain + "/service/service.svc/"
                data = await getNewData(
                    localStorage.getItem("MATRAM"),
                    "WORKSTATION_ID='" + decodedText + "'",
                    url
                );
                localStorage.setItem("URL", url);
                workstation = decodedText;
                document.getElementById("result-form-total").classList.remove("d-none");
                document.getElementById("result-form-loading").classList.add("d-none");
                document.getElementById("result-form").classList.remove("d-none");
                document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
            } else {
                document.getElementById("result-form-total").classList.remove("d-none");
                document.getElementById("result-form-loading").classList.add("d-none");
                document.getElementById("result-form-title").classList.remove("d-none");
                document.getElementById("result-form-stationID").classList.add("d-none");
                document.getElementById("result-form-stationName").classList.add("d-none");
                document.getElementById("result-truycap").classList.add("d-none");
                toastr.error("Vui lòng quét đúng mã QR!");
            }

            if (data.data != []) {
                document.getElementById("result-truycap").disabled = false;
                matram = workstation;
                const value = await getDomain(workstation);
                document.getElementById("result-form-stationID").value = workstation;
                document.getElementById("result-form-stationName").value = value[0].WORKSTATION_NAME;
                document.getElementById("footer-stationName").textContent = workstation + " - " + value[0].WORKSTATION_NAME;
                checkCam = true;
                localStorage.setItem("MATRAM", workstation);
                toastr.success("Quét QR thành công");
            } else {
                document.getElementById("result-form-total").classList.remove("d-none");
                document.getElementById("result-form-loading").classList.add("d-none");
                document.getElementById("result-form-title").classList.remove("d-none");
                document.getElementById("result-form-stationID").classList.add("d-none");
                document.getElementById("result-form-stationName").classList.add("d-none");
                document.getElementById("result-truycap").classList.add("d-none");
                toastr.error("Vui lòng quét đúng mã QR!");
            }
        }
    }

    // Hàm xử lý khi quét thất bại
    function onScanFailure(error) {
        // Xử lý lỗi (nếu cần)
    }

    // Khi nhấn nút upload QR từ hình ảnh
    $("#upload-qr").click(function () {
        $("#file-input").click();  // Mở hộp thoại chọn file
    });

    // Khi chọn file hình ảnh từ input
    $("#file-input").change(function (event) {
        var file = event.target.files[0];  // Đảm bảo lấy file đúng
        if (file) {
            // Dừng quét camera trước khi quét file
            if (isScannerRunning) {
                html5QrCode.stop().then(function () {
                    isScannerRunning = false;  // Đánh dấu scanner đã dừng
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var img = new Image();
                        img.onload = function () {
                            // Quét QR từ hình ảnh đã tải lên
                            html5QrCode.scanFile(file).then(async decodedText => {  // Sửa tại đây
                                document.getElementById("result-form").classList.remove("d-none");
                                document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
                                let data;
                                let domain;
                                let workstation;
                                let checkQRcode = decodedText.split(',');
                                
                                // if(checkQRcode[0].substring(0, 3) == "T20"){
                                if(typeQR == 2 || typeQR == 3){
                                    console.log(2);
                                    data = await getDataMDQRcode(decodedText.replaceAll(',', '$'));  
                                    console.log(data);
                                    
                                    if(data.length > 0){
                                        if(checkTab){
                                            if(data[0].LOT_ID == 0){
                                                const dataQRCODE = await getDM("DM_QRCODE", "LOT_ID='"+$('#lot-number').val()+"' AND LOT_CLASS='"+$('#classProduct').val()+"'")
                                                if(dataQRCODE.data.length < $('#classProductNumber').val()){
                                                    const willInsertData = {
                                                        PR_KEY: data[0].PR_KEY,
                                                        QR_CODE: decodedText,
                                                        MA_SAN_PHAM: checkQRcode[1],
                                                        LOT_ID: $('#lot-number').val(),
                                                        LOT_CLASS: $('#classProduct').val(),
                                                        DATE_CREATE: new Date(),
                                                        ACTIVATE_WARRANTY: new Date('1999-01-01 07:00:00.000'),
                                                        USER_ID: UserID,
                                                        DATASTATE: "EDIT",
                                                    };
                                                    add('DM_QRCODE', willInsertData);
                                                    toastr.success("Quét QR và lưu thông tin thành công!");
                                                } else {
                                                    toastr.error("Lớp đã quét đủ vui lòng nhập lớp mới!");
                                                }
                                            } else {
                                                if(data[0].LOT_ID == $('#lot-number').val()){
                                                    toastr.error("Sản phẩm đã tồn tại trong lô này!");
                                                } else {
                                                    toastr.error("Sản phẩm đã thuộc 1 lô khác, vui lòng kiểm tra lại!");
                                                }
                                            }
                                            scanAgain()
                                        } else {
                                            document.getElementById("result-product").classList.remove("d-none");
                                            document.getElementById("result-form-loading").classList.add("d-none");
                                            document.getElementById("result-form").classList.remove("d-none");
                                            document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
                                            document.getElementById("result-product-truycap").disabled = false;
                                            document.getElementById("result-form-productName").value = checkQRcode[1];
                                            document.getElementById("result-form-productCode").value = checkQRcode[2].substring(1);
                                            document.getElementById("header-productName").textContent = checkQRcode[1]+" - "+checkQRcode[2].substring(1);
                                            changeDataWarranty(data);
                                        }
                                        
                                    } else {
                                        if(typeQR == 3 && checkQRcode[0].substring(0, 3) == "T20"){
                                            console.log(1);
                                            
                                            const dataQRCODE = await getDM("DM_QRCODE", "LOT_ID='"+$('#lot-number').val()+"' AND LOT_CLASS='"+$('#classProduct').val()+"'")
                                            if(dataQRCODE.data.length < $('#classProductNumber').val()){
                                                const willInsertData = {
                                                    QR_CODE: decodedText,
                                                    MA_SAN_PHAM: checkQRcode[1],
                                                    LOT_ID: $('#lot-number').val(),
                                                    LOT_CLASS: $('#classProduct').val(),
                                                    DATE_CREATE: new Date(),
                                                    ACTIVATE_WARRANTY: new Date('1999-01-01 07:00:00.000'),
                                                    USER_ID: UserID,
                                                    DATASTATE: "ADD",
                                                };
                                                await add('DM_QRCODE', willInsertData).then(async data => {
                                                    try {
                                                        toastr.success("Quét QR và lưu thông tin thành công!");
                                                        const dataEdit = await getDataMDQRcode(decodedText.replaceAll(',', '$'));
                                                        const willInsert = {
                                                            TYPE: "ADD",
                                                            ERROR_NAME: "Hoàn thành sản phẩm",
                                                            DESCRIPTION: "Nhập sản phẩm vào hệ thống",
                                                            DATE_CREATE: new Date(),
                                                            ERROR_STATUS: 0,
                                                            QRCODE_ID: dataEdit[0].PR_KEY,
                                                            USER_ID: UserID,
                                                            DATASTATE: "ADD",
                                                        };
                                                        await add('WARRANTY_ERROR', willInsert)
                                                        scanAgain();
                                                    } catch (e) { }
                                                }).catch(err => {
                                                    console.error('Error:', err);
                                                });
                                            console.log(2);
                                                
                                            } else {
                                                toastr.error("Lớp đã quét đủ vui lòng nhập lớp mới!");
                                                scanAgain();
                                                console.log(1);
                                            }
                                        } else {
                                            const dataLot = await getDM("WARRANTY_LOT", "1=1")
                                            console.log(dataLot);
                                            const checkValue = dataLot.data.some(item => item.LOT_NUMBER == decodedText);
                                            if(checkValue){
                                                console.log(decodedText);
                                            } else if (checkQRcode[0].substring(0, 3) == "T20") {
                                                const willInsertData = {
                                                    QR_CODE: decodedText,
                                                    MA_SAN_PHAM: checkQRcode[1],
                                                    DATE_CREATE: new Date(),
                                                    ACTIVATE_WARRANTY: new Date('1999-01-01 07:00:00.000'),
                                                    USER_ID: UserID,
                                                    DATASTATE: "ADD",
                                                };
                                                add('DM_QRCODE', willInsertData).then(async data => {
                                                    try {
                                                        toastr.success("Quét QR và lưu thông tin thành công!");
                                                        if(checkTab){
                                                            scanAgain();
                                                        } else {
                                                            document.getElementById("result-product").classList.remove("d-none");
                                                            document.getElementById("result-form-loading").classList.add("d-none");
                                                            document.getElementById("result-form").classList.remove("d-none");
                                                            document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
                                                            document.getElementById("result-product-truycap").disabled = false;
                                                            document.getElementById("result-form-productName").value = checkQRcode[1];
                                                            document.getElementById("result-form-productCode").value = checkQRcode[2].substring(1);
                                                            document.getElementById("header-productName").textContent = checkQRcode[1]+" - "+checkQRcode[2].substring(1);
                                                            data = await getDataMDQRcode(decodedText.replaceAll(',', '$'));  
                                                            const willInsertData = {
                                                                TYPE: "ADD",
                                                                ERROR_NAME: "Hoàn thành sản phẩm",
                                                                DESCRIPTION: "Nhập sản phẩm vào hệ thống",
                                                                DATE_CREATE: new Date(),
                                                                ERROR_STATUS: 0,
                                                                QRCODE_ID: data[0].PR_KEY,
                                                                USER_ID: UserID,
                                                                DATASTATE: "ADD",
                                                            };
                                                            await add('WARRANTY_ERROR', willInsertData)
                                                            changeDataWarranty(data);
                                                        }
                                                    } catch (e) { }
                                                }).catch(err => {
                                                    console.error('Error:', err);
                                                });
                                                console.log(2);
                                                
                                            } else {
                                                document.getElementById("result-form").classList.remove("d-none");
                                                document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
                                                document.getElementById("result-form-total").classList.remove("d-none");
                                                document.getElementById("result-form-loading").classList.add("d-none");
                                                document.getElementById("result-form-title").classList.remove("d-none");
                                                document.getElementById("result-form-stationID").classList.add("d-none");
                                                document.getElementById("result-form-stationName").classList.add("d-none");
                                                document.getElementById("result-truycap").classList.add("d-none");
                                                toastr.error("Vui lòng quét đúng mã QR!");
                                            }
                                        }
                                        
                                    }
                                } else {
                                    console.log(3);
                                    
                                    if (decodedText.length > 6) {
                                        var resultArray = decodedText.split("$");
                                        data = await getNewData(
                                            localStorage.getItem("MATRAM"),
                                            "WORKSTATION_ID='" + resultArray[1] + "'",
                                            resultArray[0]
                                        );
                                        localStorage.setItem("URL", resultArray[0]);
                                        workstation = resultArray[1];
                                        document.getElementById("result-form-total").classList.remove("d-none");
                                        document.getElementById("result-form-loading").classList.add("d-none");
                                        document.getElementById("result-form").classList.remove("d-none");
                                        document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
                                    } else if (decodedText.length == 6) {
                                        domain = await getDomain(decodedText, 'domain');
                                        const url = "https://" + domain + "/service/service.svc/"
                                        data = await getNewData(
                                            localStorage.getItem("MATRAM"),
                                            "WORKSTATION_ID='" + decodedText + "'",
                                            url
                                        );
                                        localStorage.setItem("URL", url);
                                        workstation = decodedText;
                                        document.getElementById("result-form-total").classList.remove("d-none");
                                        document.getElementById("result-form-loading").classList.add("d-none");
                                        document.getElementById("result-form").classList.remove("d-none");
                                        document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
                                    } else {
                                        document.getElementById("result-form-total").classList.remove("d-none");
                                        document.getElementById("result-form-loading").classList.add("d-none");
                                        toastr.error("Vui lòng quét đúng mã QR!");
                                    }


                                    if (data != []) {

                                        document.getElementById("result-truycap").disabled = false;
                                        matram = workstation
                                        const value = await getDomain(workstation);
                                        document.getElementById("result-form-stationID").value = workstation;
                                        document.getElementById("result-form-stationName").value = value[0].WORKSTATION_NAME;
                                        document.getElementById("footer-stationName").textContent = workstation + " - " + value[0].WORKSTATION_NAME;
                                        checkCam = true;
                                        toastr.success("Quét QR thành công");
                                        localStorage.setItem("MATRAM", workstation);
                                    }
                                }
                            }).catch(err => {
                                document.getElementById("result-form").classList.remove("d-none");
                                document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
                                document.getElementById("result-form-total").classList.remove("d-none");
                                document.getElementById("result-form-loading").classList.add("d-none");
                                document.getElementById("result-form-title").classList.remove("d-none");
                                document.getElementById("result-form-stationID").classList.add("d-none");
                                document.getElementById("result-form-stationName").classList.add("d-none");
                                document.getElementById("result-truycap").classList.add("d-none");
                                toastr.error("Vui lòng quét đúng mã QR!");
                            });
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);  // Đọc hình ảnh từ file
                }).catch(err => {
                    console.error("Lỗi khi dừng camera: ", err);
                });
            } else {
                // Nếu không có scanner đang chạy, quét trực tiếp từ hình ảnh
                var reader = new FileReader();
                reader.onload = function (e) {
                    var img = new Image();
                    img.onload = function () {
                        html5QrCode.scanFile(file).then(decodedText => {
                            $("#result").text("Kết quả quét: " + decodedText); // Hiển thị kết quả
                        }).catch(err => {
                            $("#result").text("Không thể quét QR từ hình ảnh.");
                            console.error("Lỗi khi quét hình ảnh QR: ", err);
                        });
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);  // Đọc hình ảnh từ file
            }
        }
    });


    //lấy value khi nhập mã trạm thủ công.
    async function getInputValue() {
        var inputValue = document.getElementById("device_name").value;
        if (inputValue == null || inputValue == "") {
            toastr.error("Vui lòng nhập mã trạm!");
        } else {
            $("#loading-popup").show()
            CheckWorkStation(inputValue)
        }
    }

    // ẩn phần bước khi bật bàn phí trên mobile
    function adjustFooter() {
        const footer = document.querySelector('.footer-instruct');
        const windowHeight = window.innerHeight;

        window.addEventListener('resize', () => {
            if (window.innerHeight < windowHeight) {
                // Keyboard is visible, hide or adjust footer
                document.getElementById("footer-instruct-text").classList.add("d-none");
                document.getElementById("footer-instruct-warranty").classList.add("d-none");
                footer.style.display = 'none'; // You can also reposition it instead of hiding
            } else {
                // Keyboard is hidden, show footer
                document.getElementById("footer-instruct-text").classList.remove("d-none");
                document.getElementById("footer-instruct-warranty").classList.remove("d-none");
                footer.style.display = 'block';
            }
        });
    }
    // adjustFooter();
    // Sidebar toggle logic
    const menuToggle = $(".menuToggle");
    const sidebar = $(".sidebar");

    // Toggle the sidebar visibility
    menuToggle.on("click", (e) => {
        e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
        sidebar.toggleClass("open");
    });

    // Detect clicks outside the sidebar
    $(document).on("click", (e) => {
        if (sidebar.hasClass("open") && !$(e.target).closest(".sidebar").length) {
            sidebar.removeClass("open");
        }
    });


    // Handle menu item clicks
    const menuItems = document.querySelectorAll(".menu-item, .submenu li");
    menuItems.forEach((item) => {
        item.addEventListener("click", async (e) => {
            e.stopPropagation(); // Prevent the click from propagating to the document

            // Detect which menu item was clicked
            const menuText = item.innerText.trim(); // Get the text of the menu item

            if (menuText == "Giải pháp thông minh") {
                console.log(menuText);
                $("#tab-add-category").click();
            } else if (menuText == "Quản lý danh mục") {
                document.getElementById("history-setting").classList.remove("d-none");
                document.getElementById("history-homePage").classList.add("d-none");
                document.getElementById("list-category").classList.remove("d-none");
                document.getElementById("save-category").classList.add("d-none");
                $(".history-avt").removeClass("d-none");
                document.getElementById("category-back").classList.add("d-none");
                showCategory()
                // document.querySelector(".tablink-history").click();
            } else if (menuText == "Truy cập Trạm") {
                document.getElementById("history-setting").classList.add("d-none");
                document.getElementById("history-homePage").classList.remove("d-none");
                localStorage.setItem('listItemCategory', JSON.stringify([]));
                showHistory()
            } else if (menuText == "Thông tin công ty") {
                window.location.href = "https://homeos.com.vn/";
            } else if (menuText == "Thông tin sản phẩm") {
                $("#history").addClass("hidden");
                $("#ScanQRWarranty").removeClass("hidden");
                $(".warrantyDetailProduct").removeClass("d-none");
                document.querySelector(".tablinkGuarantee").click();
                $("#ScanAllQRcode").addClass("d-none");
                $("#lotProduct").addClass("d-none");
                checkTab = false;
            } else if (menuText == "Quét lô sản phẩm") {
                $("#history").addClass("hidden");
                $("#ScanQRWarranty").removeClass("hidden");
                $(".warrantyDetailProduct").addClass("d-none");
                $("#ScanAllQRcode").removeClass("d-none");
                $("#lotProduct").addClass("d-none");
                $('#lot-number').empty();
                const Data = await getDM('WARRANTY_LOT', "1=1");
                const newOption = $('<option>', {
                    value: '0', // Giá trị của option
                    text: 'Chọn lô sản phẩm' // Nội dung hiển thị
                });
                // Thêm vào select
                $('#lot-number').append(newOption);
                Data.data.forEach(item => {
                    console.log(item);
                    const newOption = $('<option>', {
                        value: item.PR_KEY, // Giá trị của option
                        text: item.LOT_NAME // Nội dung hiển thị
                    });
                    // Thêm vào select
                    $('#lot-number').append(newOption);
                });
                checkTab = true;
            } else if (menuText == "Quản lý và xuất lô hàng") {
                $("#history").addClass("hidden");
                $("#ScanQRWarranty").removeClass("hidden");
                $(".warrantyDetailProduct").addClass("d-none");
                $("#ScanAllQRcode").addClass("d-none");
                $("#lotProduct").removeClass("d-none");
                addItemLotproduct();
            }
            // Close the sidebar after selection (optional)
            sidebar.removeClass("open");
        });
    });

    // Code Bảo hành:

    // Hàm thêm sửa xoá dữ liệu
    function add(table, data) {
        // const d = {Uid: "vannt", Sid:'3d798037-9bd9-4195-8673-a4794547d2fd', tablename:table, jd:JSON.stringify(data), ex:''};
        const d = {Uid: "admin", Sid:'cb880c13-5465-4a1d-a598-28e06be43982', tablename:table, jd:JSON.stringify(data), ex:''};
        
        return new Promise((resolve, reject) => {
            $.ajax({
                // url: "https://DEV.HOMEOS.vn/service/service.svc/ExecuteData?callback=?",
                url: "https://central.homeos.vn/service_XD/service.svc/ExecuteData?callback=?",
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

    // lấy dữ liệu QR code
    function getDataMDQRcode(QRcode) {

        // const url = "https://DEV.HOMEOS.vn/service/service.svc/";
        const url = "https://central.homeos.vn/service_XD/service.svc/";
        
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url + "ApiServicePublic/" + "GetDataQRcode" + "/" + "QRCODEINPUT=" + QRcode,
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
                    // document.getElementById("result-form").classList.remove("d-none");
                    // document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
                    // toastr.error("Vui lòng quét đúng mã QR của trạm mưa");
                    document.getElementById("result-form").classList.remove("d-none");
                    document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
                    document.getElementById("result-form-total").classList.remove("d-none");
                    document.getElementById("result-form-loading").classList.add("d-none");
                    document.getElementById("result-form-title").classList.remove("d-none");
                    document.getElementById("result-form-stationID").classList.add("d-none");
                    document.getElementById("result-form-stationName").classList.add("d-none");
                    document.getElementById("result-truycap").classList.add("d-none");
                    toastr.error("Vui lòng quét đúng mã QR!");
                },
            });
        });
    } 

    $('.bottom-navigation button').click(function () {
        value = $(this).data('tab');
        $('.bottom-navigation button').removeClass('menuWarranty');
        $(this).addClass('menuWarranty');
        $('.tab-content').removeClass('active');
        $('#tab-' + value).addClass('active');
    });

    function changeDataWarranty(data) {
        let DataQRcode = data[0].QR_CODE.split(',');
        localStorage.setItem("productWarranty", JSON.stringify(data));
        const dataWarranty = JSON.parse(localStorage.getItem("productWarranty"));
        console.log(dataWarranty);
        document.getElementById('productName').textContent = "Tên sản phẩm: "+ data[0].PRODUCT_NAME;
        document.getElementById('productCode').textContent = "Mã định danh: "+ data[0].PRODUCT_CODE;
        document.getElementById('productSeri').textContent = "Số seri: "+ DataQRcode[2].substring(1);
        document.getElementById("deviceImg").src = data[0].PRODUCT_IMG;
        if(data[0].ACTIVATE_WARRANTY == "1999-01-01T00:00:00"){
            document.getElementById('warrantyActive').textContent = "Chưa kích hoạt";
            document.getElementById('warrantyTimeActive').textContent = " ";
            const WarrantyAct = DataQRcode[0].substring(1, 5) +"-"+ DataQRcode[0].substring(5, 7) +"-"+ DataQRcode[0].substring(7, 9);
            const time =  calculateWarrantyRemaining(data[0].DATE_CREATE,  Number(data[0].TIME_WARRANTY));
            console.log(WarrantyAct, data);
            document.getElementById('warrantyTime').textContent = time;
            document.getElementById('result-product-warranty').classList.remove("d-none");
        } else {
            document.getElementById('warrantyActive').textContent = "Đã kích hoạt";
            const now = new Date(data[0].ACTIVATE_WARRANTY);

            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            document.getElementById('warrantyTimeActive').textContent = `${year}-${month}-${day}`;
            document.getElementById('result-product-warranty').classList.add("d-none");
            const WarrantyAct = DataQRcode[0].substring(1, 5) +"-"+ DataQRcode[0].substring(5, 7) +"-"+ DataQRcode[0].substring(7, 9);
            const time =  calculateWarrantyRemaining(data[0].DATE_CREATE,  Number(data[0].TIME_WARRANTY));
            document.getElementById('warrantyTime').textContent = time;
        }
        // const item = { 'CodeWorkStation': workstationID, 'NameWorkStation': state[0].WORKSTATION_NAME, 'domain': domain, 'date': getCurrentTime(), 'workstationType': state[0].TEMPLATE_TOOLTIP }
        // localStorage.setItem('itemHistory', JSON.stringify(item));
        saveWarranty(data);
        addItemHistoryWarranty(data[0].PR_KEY, data);
    }

    $('#result-product-warranty').click(function () {
        const dataWarranty = JSON.parse(localStorage.getItem("productWarranty"));
        const DataQRcode = dataWarranty[0].QR_CODE.split(',');
        const confirmActivate = confirm(`Xác nhận kích hoạt bảo hành của sản phẩm "${dataWarranty[0].PRODUCT_NAME}-${DataQRcode[2].substring(1)}" không?`);
        if (confirmActivate) {
            const willInsertData = {
                PR_KEY: dataWarranty[0].PR_KEY,
                QR_CODE: dataWarranty[0].QR_CODE,
                MA_SAN_PHAM: dataWarranty[0].MA_SAN_PHAM,
                DATE_CREATE: dataWarranty[0].DATE_CREATE,
                ACTIVATE_WARRANTY: new Date(),
                USER_ID: dataWarranty[0].USER_ID,
                DATASTATE: "EDIT",
            };
            add('DM_QRCODE', willInsertData).then(async data => {
                try {
                    toastr.success("Kích hoạt bảo hành của sản phẩm thành công!");
                    const InsertData = {
                        TYPE: "ACTIVATE",
                        ERROR_NAME: "Kích hoạt bảo hành",
                        DESCRIPTION: DataUser.name +" đã kích hoạt bảo hành sản phẩm",
                        DATE_CREATE: new Date(),
                        ERROR_STATUS: 0,
                        QRCODE_ID: dataWarranty[0].PR_KEY,
                        USER_ID: UserID,
                        DATASTATE: "ADD",
                    };
                    add('WARRANTY_ERROR', InsertData)

                    data = await getDataMDQRcode(dataWarranty[0].QR_CODE.replaceAll(',', '$'));  
                    changeDataWarranty(data);
                } catch (e) { }
            }).catch(err => {
                console.error('Error:', err);
            });
        }
    });

    function calculateWarrantyRemaining(startDate, timeWarranty) {
        const warrantyPeriodMonths = timeWarranty; // Thời gian bảo hành là 12 tháng

        // Chuyển ngày bắt đầu bảo hành sang đối tượng Date
        const startDateObj = new Date(startDate);
        // Ngày kết thúc bảo hành
        const warrantyEndDate = new Date(startDateObj);
        warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantyPeriodMonths);

        console.log(warrantyEndDate);
        
        // Ngày hiện tại
        const currentDate = new Date();

        // Tính thời gian còn lại
        if (currentDate > warrantyEndDate) {
            return "Thời gian bảo hành đã hết.";
        } else {
            // Tính tổng số tháng còn lại
            let totalMonthsRemaining =
                (warrantyEndDate.getFullYear() - currentDate.getFullYear()) * 12 +
                (warrantyEndDate.getMonth() - currentDate.getMonth());

            // Tính số ngày còn lại
            let daysRemaining = warrantyEndDate.getDate() - currentDate.getDate();

            // Điều chỉnh nếu số ngày âm
            if (daysRemaining < 0) {
                // Lấy số ngày của tháng trước
                const lastMonth = new Date(warrantyEndDate.getFullYear(), warrantyEndDate.getMonth(), 0);
                daysRemaining += lastMonth.getDate();
                totalMonthsRemaining -= 1;
            }
            // ${daysRemaining} ngày.
            return `Còn lại: ${totalMonthsRemaining} tháng`;
        }
    }

    $("#submitError").click(function () {
        // Lấy giá trị từ các trường
        const errorInput = $("#errorInput").val();
        const errorType = $("#errorType").val();
        const errorDesc = $("#errorDesc").val();
        const dataWarranty = JSON.parse(localStorage.getItem("productWarranty"));
        console.log(dataWarranty);
        const willInsertData = {
            TYPE: 'ERROR',
            ERROR_TYPE: errorType,
            ERROR_NAME: errorInput,
            DESCRIPTION: errorDesc,
            DATE_CREATE: new Date(),
            ERROR_STATUS: 1,
            QRCODE_ID: dataWarranty[0].PR_KEY,
            USER_ID: UserID,
            DATASTATE: "ADD",
        };
        add('WARRANTY_ERROR', willInsertData).then(async data => {
            try {
                toastr.success("Báo lỗi thành công!");
                addItemHistoryWarranty(dataWarranty[0].PR_KEY, dataWarranty);
                $("#BackWarranty").click();
            } catch (e) { }
        }).catch(err => {
            console.error('Error:', err);
        });
    });

    $('#generateQRCodes').click(function () {
        startValue = parseInt($('#startValue').val()) || 1;
        getTranNo();
    });
    
    
    async function getTranNo() {
        try {
            const data = await getDM('SYS_TRAN_NO', "TABLE_NAME='DM_QRCODE'");
            const state = data.data;
            let temp = state[0].TRAN_NO || null;
            temp = temp.replace(/\[YEAR\]/g, (new Date()).getFullYear());
            temp = temp.replace(/\[MONTH\]/g, ((new Date()).getMonth() + 1).toString().padStart(2, '0'));
            temp = temp.replace(/\[DAY\]/g, (new Date()).getDate().toString().padStart(2, '0'));
            temp = temp.replace(/\[HOUR\]/g, (new Date()).getHours().toString().padStart(2, '0'));
            temp = temp.replace(/\[MINUTE\]/g, (new Date()).getMinutes().toString().padStart(2, '0'));
            temp = temp.replace(/\[SECOND\]/g, (new Date()).getSeconds().toString().padStart(2, '0'));
            const codes = [];
            let auto_key = state[0].AUTO_KEY;
            for (let i = 1; i <= startValue; i++) {
                auto_key += 1;
                const code = temp.replace(/\[AUTO_KEY\]/g, (auto_key).toString().padStart(state[0].LENGTH_KEY, '0'));
                codes.push(code);
            }
            generateQRCodes(codes);
            console.log(auto_key, state[0].TABLE_NAME, state[0].TRAN_NO, state[0].LENGTH_KEY);
            
            updateTranNo(auto_key, state[0].TABLE_NAME, state[0].TRAN_NO, state[0].LENGTH_KEY);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
    }

    function getDM(table_name, c) {
        const d = {
            // Uid: 'vannt',
            // Sid: 'b99213e4-a8a5-45f4-bb5c-cf03ae90d8d7',
            Uid: 'admin',
            Sid: 'cb880c13-5465-4a1d-a598-28e06be43982',
            tablename: table_name,
            c: c,
            other: '',
            cmd: ''
        };
        
        // const Url = 'https://DEV.HOMEOS.vn/service/service.svc/';
        
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "https://central.homeos.vn/service_XD/service.svc/getDm?callback=?",
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

    async function generateQRCodes(listcode) {
        const newTab = window.open('', '_blank');
        if (!newTab || newTab.closed || typeof newTab.closed == 'undefined') {
            alert('Tab mới không thể mở. Vui lòng kiểm tra cài đặt popup của trình duyệt.');
            return;
        }
        let htmlContent = `
            <html>
            <head>
                <style>
                    body {
                        text-align: center;
                        padding: 5px;
                    }
                    .qr-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(68px, 1fr));
                        margin-top: 10px;
                    }
                    .qr-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .qr-item img {
                        width: 57px;
                    }
                    .qr-item p {
                        margin-top: 5px;
                        margin-bottom: 8px;
                        font-size: 11px;
                    }
                </style>
            </head>
            <body>
                <div class="qr-grid">
        `;
        for (const code of listcode) {
            // Tạo một <div> tạm để render mã QR
            const tempDiv = document.createElement('div');
            const qrCode = new QRCode(tempDiv, {
                text: code,           // Mã code muốn tạo
                width: 57,           // Chiều rộng mã QR
                height: 57           // Chiều cao mã QR
                // width: 76,           // Chiều rộng mã QR
                // height: 76           // Chiều cao mã QR
            });

            // Chờ QRCode render xong và lấy hình ảnh từ thẻ canvas
            const qrDataUrl = await new Promise((resolve) => {
                setTimeout(() => {
                    const canvas = tempDiv.querySelector('canvas');  // Lấy thẻ canvas chứa mã QR
                    resolve(canvas.toDataURL());                    // Chuyển canvas thành DataURL
                }, 500);  // Đợi một thời gian ngắn để chắc chắn mã QR được tạo xong
            });
            const mang = code.split(',');
            
            // Thêm nội dung HTML vào chuỗi htmlContent
            htmlContent += `
                <div class="qr-item">
                    <img src="${qrDataUrl}" alt="QR Code for ${code}" />
                    <p>${mang[2].substring(3)}</p>
                </div>
            `;
        }

        
        


        // Chèn nội dung HTML vào tab mới
        newTab.document.write(htmlContent);
        newTab.document.close();

        const script = newTab.document.createElement("script");
        script.textContent = "window.onload = function() { window.print(); }";
        newTab.document.body.appendChild(script);
    }

    async function generateLotQRCodes(item) {
        const newTab = window.open('', '_blank');
        if (!newTab || newTab.closed || typeof newTab.closed == 'undefined') {
            alert('Tab mới không thể mở. Vui lòng kiểm tra cài đặt popup của trình duyệt.');
            return;
        }

        let htmlContent = `
            <html>
            <head>
                <style>
                    body {
                        text-align: center;
                        padding: 5px;
                    }
                    p{

                    }
                </style>
            </head>
            <body>
                <div class="qr-grid">
                    <h4>Khi nhận hàng sử dụng zalo miniapp</h4>
                    <h4>HomeOS IoT Smart để xác nhận</h4>
        `;

        try {
            // Tạo QR code dưới dạng canvas
            const canvas = document.createElement('canvas');
            await QRCode.toCanvas(canvas, item.LOT_NUMBER, { width: 300 });

            // Chuyển canvas thành ảnh base64
            const image = canvas.toDataURL('image/png');

            // Thêm thẻ <img> chứa ảnh QR vào htmlContent
            htmlContent += `<img src="${image}" alt="QR Code">
                <p>${item.LOT_NUMBER}</p>
            `;

            // Chèn nội dung HTML vào tab mới
            newTab.document.write(htmlContent);
            newTab.document.close();

            // Thêm script để in sau khi nội dung được tải
            const script = newTab.document.createElement("script");
            script.textContent = "window.onload = function() { window.print(); }";
            newTab.document.body.appendChild(script);
        } catch (error) {
            console.error("Lỗi khi tạo mã QR:", error);
            alert('Lỗi khi tạo mã QR!');
        }
    }

    async function generateVoucher(item) {
        console.log(item);
        const data = await getDM("DM_QRCODE", "LOT_ID='"+item.PR_KEY+"'")
        let uniqueClasses = [...new Set(data.data.map(item => item.LOT_CLASS))];
        uniqueClasses.sort();
        console.log(uniqueClasses);
        
        const groupedData = uniqueClasses.map(cls => {
            return {
                LOT_CLASS: cls,
                items: data.data.filter(item => item.LOT_CLASS === cls)
            };
        });
        console.log(groupedData);
        const newTab = window.open('', '_blank');
        if (!newTab || newTab.closed || typeof newTab.closed == 'undefined') {
            alert('Tab mới không thể mở. Vui lòng kiểm tra cài đặt popup của trình duyệt.');
            return;
        }
        let htmlContent = `
            <html>
            <head>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Times New Roman', Times, serif;
                    }
                    .header-logo {
                        width: 80px;
                    }
                    .table-bordered td, .table-bordered th {
                        vertical-align: middle;
                    }
                    .text-small {
                        font-size: 0.85rem;
                    }
                    .text-start {
                        font-size: 13px;
                    }
                </style>
            </head>
            <body>
                <div class="my-4">
                    <div class="row">
                        <div class="col-8 text-center">
                            <img src="https://homeos.com.vn/storage/photos/logo_1611367959_1716866836.webp" style="width: 150px;" alt="Logo" class="header-logo">
                            <p class="mt-2">
                                <strong>CÔNG TY CỔ PHẦN CÔNG NGHỆ HOMEOS VIỆT NAM</strong><br>
                                Địa chỉ: Số 24, Ngõ 22, Đường Kim Giang, Q. Thanh Xuân, TP Hà Nội
                            </p>
                        </div>
                        <div class="col-4 text-center" style="margin-top: 30px;">
                            <p class="text-small"><b>Mẫu số 02 - VT</b></p>
                            <p class="text-small">(Ban hành theo Thông tư số: 200/2014/TT-BTC ngày 22/12/2014 của Bộ Tài Chính)</p>
                        </div>
                    </div>

                    <div class="text-center my-4">
                        <h4><strong>PHIẾU XUẤT KHO</strong></h4>
                        <p class="text-small m-0"><b>(Kiêm bảo hành)</b></p>
                        <p class="m-0"><strong>Số phiếu: `+item.LOT_NUMBER+`</strong></p>
                        <p class="m-0"><b><i>Ngày ... tháng ... năm 2025</i></b></p>
                    </div>

                    <p class="m-0" style="font-size: 14px;">- Họ và tên người nhận hàng: CÔNG TY TNHH ĐIỆN CÔNG NGHIỆP KHỞI MINH</p>
                    <p class="m-0" style="font-size: 14px;">- Lý do xuất kho: Xuất bán</p>
                    <p class="m-0" style="font-size: 14px;">- Xuất tại địa điểm: J04 - L02, An Phú Shop Villa, Dương Kinh, Hà Đông, Hà Nội.</p>

                    <table class="table table-bordered text-center mt-2">
                        <thead>
                            <tr style="font-size: 14px;">
                                <th>STT</th>
                                <th>DANH MỤC HÀNG HÓA</th>
                                <th>ĐVT</th>
                                <th>SL</th>
                                <th style="width: 30px;">GHI CHÚ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="5" style="text-align: start;"><b>Thiết bị rơ le an toàn phao nước</b></td>
                            </tr>
        `;
        for (let i = 0; i < groupedData.length; i++) {
            let danhMuc = '';
            let number = 0;
            groupedData[i].items.forEach(element => {
                number++;
                const checkQRcode = element.QR_CODE.split(',');
                
                if(number == groupedData[i].items.length){
                    danhMuc += checkQRcode[2].substring(3).replace(/\./g, "");
                } else {
                    danhMuc += checkQRcode[2].substring(3).replace(/\./g, "")+ ', ';
                }
            });
            console.log(danhMuc);
            htmlContent +=`
            <tr>
                <td style="font-size: 15px;">`+groupedData[i].LOT_CLASS+`</td>
                <td class="text-start">
                    `+danhMuc+`
                </td>
                <td style="font-size: 15px;">Bộ</td>
                <td style="font-size: 15px;">`+groupedData[i].items.length+`</td>
                <td></td>
            </tr>
            `
            
        }
        htmlContent += `
            </tbody>
            </table>
            <p style="font-size: 14px;">Số chứng từ gốc kèm theo:.....................................................................................</p>
            <div class="row text-center" style="font-size: 14px;">
                <div class="col-3">
                    <b>Người lập phiếu</b>
                </div>
                <div class="col-3">
                    <b>Người nhận hàng</b>
                </div>
                <div class="col-3">
                    <b>Thủ kho</b>
                </div>
                <div class="col-3">
                    <b>Kế toán</b>
                </div>
            </div>
        `


        // Chèn nội dung HTML vào tab mới
        newTab.document.write(htmlContent);
        newTab.document.close();

        const script = newTab.document.createElement("script");
        script.textContent = "window.onload = function() { window.print(); }";
        const script1 = newTab.document.createElement("script");
        script1.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js";
        newTab.document.body.appendChild(script1);
        newTab.document.body.appendChild(script);
    }

    function updateTranNo(result, tableName, tranNo, lengthKey) {
        const willInsertData = {
            PR_KEY: 15,
            TABLE_NAME: tableName,
            TRAN_NO: tranNo,
            ORGANIZATION_ID: '',
            AUTO_KEY: result,
            LENGTH_KEY: lengthKey,
            DATASTATE: "EDIT",
        };
        console.log(willInsertData);
        add(user_id, session, 'SYS_TRAN_NO', willInsertData)
    }
    
    async function addItemHistoryWarranty(QRID, dataQR) {
        const data = await getDM('WARRANTY_ERROR', "QRCODE_ID='"+QRID+"'");
        const data_lot = await getDM('WARRANTY_LOT', "PR_KEY='"+dataQR[0].LOT_ID+"'");
        let dataWarranty = data.data.filter(item => item.GROUP_ID === 0);
        let dataWarrantyGroup = data.data.filter(item => item.GROUP_ID !== 0);
        if(localStorage.getItem('RoleUser') == "GUEST"){
            dataWarranty = data.data.filter(item => item.TYPE !== "ADD");
        }
        if(dataWarranty.length > 0){
            listWarrantyHistory.empty();
            for (let i = 0; i < dataWarranty.length; i++) {
                let element = '';
                const CheckGroupWarranty = dataWarrantyGroup.filter(item => item.GROUP_ID == dataWarranty[i].PR_KEY);
                let itemElement = '';
                const [dateALL, timeALL] = dataWarranty[i].DATE_CREATE.split('T');
                if(CheckGroupWarranty.length > 0){
                    for (let i = 0; i < CheckGroupWarranty.length; i++) {
                        const [date, time] = CheckGroupWarranty[i].DATE_CREATE.split('T');
                        let nameClass;
                        if(CheckGroupWarranty[i].ERROR_STATUS == 1){
                            nameClass = 'badge-warning';
                        } else if(CheckGroupWarranty[i].ERROR_STATUS == 2) {
                            nameClass = 'badge-danger';
                        } else if(CheckGroupWarranty[i].ERROR_STATUS == 3) {
                            nameClass = 'badge-success';
                        } 
                        itemElement += '<div class="vertical-timeline-item vertical-timeline-element">'+
                            '<div>'+
                                '<span class="vertical-timeline-element-icon bounce-in">'+
                                    '<i class="badge badge-dot badge-dot-xl '+nameClass+'"> </i>'+
                                '</span>'+
                                '<div class="vertical-timeline-element-content bounce-in">'+
                                    '<h4 class="timeline-title">'+CheckGroupWarranty[i].ERROR_NAME+'</h4>'+
                                    '<p>'+CheckGroupWarranty[i].DESCRIPTION+'</p>'+
                                    '<span class="vertical-timeline-element-date">'+date+'</span>'+
                                    '<span class="vertical-timeline-element-dateTime">'+time+'</span>'+
                                '</div>'+
                            '</div>'+
                        '</div>'
                    }
                }

                if(dataWarranty[i].TYPE == "ERROR"){
                    element += '<li class="parent-item">'+
                                '<button class="toggle-button">'+
                                    '<div>'+
                                        '<h4 style="margin: 0;">'+
                                            '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" style="color: #cd5757;" fill="currentColor" class="bi bi-exclamation-triangle" viewBox="0 0 16 16">'+
                                                '<path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>'+
                                                '<path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>'+
                                            '</svg>'+
                                            ' Bảo hành'+
                                        '</h4>'+
                                        '<p style="margin: 1px 0 0 0; font-size: 14px; font-weight: 300;">'+dataWarranty[i].ERROR_NAME+'</p>'+
                                        '<p style="margin: 1px 0 0 0; font-size: 14px; font-weight: 300;">'+dateALL+' '+timeALL+'</p>'+
                                    '</div>'+
                                    '<span class="arrow-icon expanded" style="transform: rotate(90deg);">▶</span>'+
                                '</button>'+
                                '<ul class="child-list" style="display: none;">'+
                                    '<div class="vertical-timeline vertical-timeline--animate vertical-timeline--one-column">'+
                                        '<div class="vertical-timeline-item vertical-timeline-element">'+
                                            '<div>'+
                                                '<span class="vertical-timeline-element-icon bounce-in">'+
                                                    '<i class="badge badge-dot badge-dot-xl badge-warning"> </i>'+
                                                '</span>'+
                                                '<div class="vertical-timeline-element-content bounce-in">'+
                                                    '<h4 class="timeline-title">Báo lỗi sản phẩm</h4>'+
                                                    '<p>'+dataWarranty[i].DESCRIPTION+'</p>'+
                                                    '<span class="vertical-timeline-element-date">'+dateALL+'</span>'+
                                                    '<span class="vertical-timeline-element-dateTime">'+timeALL+'</span>'+
                                                '</div>'+
                                            '</div>'+
                                        '</div>'+
                                        itemElement+
                                    '</div>'+
                                '</ul>'+
                            '</li>'
                } else {
                    element += '<li class="parent-item">'+
                                '<button class="toggle-button">'+
                                    '<div>'+
                                        '<h4 style="margin: 0;">'+
                                            '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" style="color: #27c527;" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">'+
                                                '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>'+
                                                '<path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>'+
                                            '</svg>'+
                                            ' '+ dataWarranty[i].ERROR_NAME+
                                        '</h4>'+
                                        '<p style="margin: 1px 0 0 0; font-size: 14px; font-weight: 300;">Sản phẩm thuộc: '+data_lot.data[0].LOT_NUMBER+'</p>'+
                                        '<p style="margin: 1px 0 0 0; font-size: 14px; font-weight: 300;">'+dateALL+' '+timeALL+'</p>'+
                                    '</div>'+
                                '</button>'+
                            '</li>'
                }
                const $element = $(element);

                $element.find('.toggle-button').on('click', function (e) {
                    e.preventDefault(); // Ngăn chặn hành động mặc định của thẻ <a>

                    // Lấy danh sách con gần nhất (nếu có)
                    const childList = $(this).siblings(".child-list");

                    // Toggle hiển thị/ẩn danh sách con
                    childList.slideToggle(200);

                    // Xoay icon mũi tên
                    const arrowIcon = $(this).find(".arrow-icon");
                    arrowIcon.toggleClass("expanded");

                    if (arrowIcon.hasClass("expanded")) {
                        arrowIcon.css("transform", "rotate(90deg)");
                    } else {
                        arrowIcon.css("transform", "rotate(0deg)");
                    }
                });

                listWarrantyHistory.append($element);
            }
        }
        
    }

    async function addItemLotproduct() {
        const data = await getDM('WARRANTY_LOT', "1=1");
        listLotProduct.empty();
        data.data.forEach(item => {
            let element = '';
            const [dateALL, timeALL] = item.DATE_CREATE.split('T');
            element += '<div class="col-12" style="padding: 5px 10px;">'+
                '<div id="PickApp-button-mua" class="iconApp">'+
                    '<div class="info-box-content">'+
                        '<div class="d-flex justify-content-between">'+
                            '<span class="app-text-number">'+item.LOT_NUMBER+'</span>'+
                        '</div>'+
                        '<span class="app-text">'+dateALL+' '+timeALL+'</span>'+
                    '</div>'+
                    '<button class="icon QRlot-button" style="background-color: #17a2b8; margin-right: 10px; box-shadow: 0 0 1px rgba(0, 0, 0, .125), 0 1px 3px rgba(0, 0, 0, .2); border: none; ">'+
                        '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="color: #fff" fill="currentColor" class="bi bi-qr-code" viewBox="0 0 16 16">'+
                            '<path d="M2 2h2v2H2z"/>'+
                            '<path d="M6 0v6H0V0zM5 1H1v4h4zM4 12H2v2h2z"/>'+
                            '<path d="M6 10v6H0v-6zm-5 1v4h4v-4zm11-9h2v2h-2z"/>'+
                            '<path d="M10 0v6h6V0zm5 1v4h-4V1zM8 1V0h1v2H8v2H7V1zm0 5V4h1v2zM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8zm0 0v1H2V8H1v1H0V7h3v1zm10 1h-1V7h1zm-1 0h-1v2h2v-1h-1zm-4 0h2v1h-1v1h-1zm2 3v-1h-1v1h-1v1H9v1h3v-2zm0 0h3v1h-2v1h-1zm-4-1v1h1v-2H7v1z"/>'+
                            '<path d="M7 12h1v3h4v1H7zm9 2v2h-3v-1h2v-1z"/>'+
                        '</svg>'+
                    '</button>'+
                    '<button class="icon print-button" style="background-color: #17a2b8; box-shadow: 0 0 1px rgba(0, 0, 0, .125), 0 1px 3px rgba(0, 0, 0, .2); border: none; ">'+
                        '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="color: #fff" fill="currentColor" class="bi bi-printer" viewBox="0 0 16 16">'+
                            '<path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>'+
                            '<path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"/>'+
                        '</svg>'+
                    '</button>'+
                '</div>'+
            '</div>'

            const $element = $(element);

            $element.find('.print-button').on('click', function (e) {
                e.preventDefault();
                generateVoucher(item);
            });

            $element.find('.QRlot-button').on('click', function (e) {
                e.preventDefault();
                generateLotQRCodes(item);
            });
            listLotProduct.append($element);
        });
    }

    function addItemWarranty() {
        warrantyItems = JSON.parse(localStorage.getItem('dataWarranty'));

        console.log(warrantyItems);
        if (warrantyItems && warrantyItems.length > 0) {
            historyListDetail.empty()
            warrantyItems.forEach(item => {
                
                const element = $(
                    '<div class="iconApp">' +
                        '<div id="App' + item.CodeWarranty + '" class="icon" style="background-color: #28a745 !important; display: block">' +
                            '<img style="width: 100%; height: 100%; object-fit: cover; border-radius: .25rem; margin: 0;" src="'+ item.imgWarranty+'" alt="">'+
                        '</div>' +
                        '<div class="info-box-content" style="padding-right: 0">' +
                            '<div class="d-flex justify-content-between">' +
                            '<span class="app-text">' + item.CodeWarranty + '</span>' +
                            '<span class="app-text" style="padding-right: 0">'+ item.date.substring(0,11)+'</span>' +
                            '</div>' +
                            '<span class="app-text-number" style="padding-right: 0">' + item.NameWarranty + '</span>' +
                        '</div>' +
                    '</div>'
                );
                // Tạo phần tử bao bọc với nút X
                const totalElement = $(
                    '<div style="padding-bottom: 13px; position: relative;" class="history-item" data-code="' + item.CodeWarranty + '">' +
                    '<div class="close-icon">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">' +
                    '<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>' +
                    '</svg>' +
                    '</div>' +
                    '</div>'
                );

                // Thêm phần tử chính vào phần tử bao bọc
                totalElement.append(element);

                // Gắn sự kiện click cho nút X
                totalElement.find('.close-icon').on('click', function (e) {
                    e.stopPropagation(); // Ngăn chặn sự kiện click lan đến phần tử chính

                    // Hiển thị popup xác nhận
                    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${item.NameWarranty} [${item.CodeWarranty}]" khỏi phần lịch sử?`);
                    if (confirmDelete) {
                        totalElement.remove(); // Xóa phần tử nếu người dùng chọn "Có"
                        warrantyItems = warrantyItems.filter(i => i.CodeWarranty !== item.CodeWarranty);
                        localStorage.setItem('dataWarranty', JSON.stringify(warrantyItems));
                        toastr.success(`Trạm "${item.CodeWarranty}" đã bị xóa!`);
                        if (warrantyItems.length == 0) {
                            showAddWorkStationButton(); // Ẩn nút nếu có ít nhất 1 phần tử
                        }
                    }
                });

                // Gắn sự kiện click cho phần tử chính
                element.on('click', function () {
                    accessDevice(item.CodeWarranty.substring(2));
                    document.getElementById("history").classList.add("hidden");
                });

                // Thêm phần tử vào danh sách lịch sử

                historyListDetail.append(totalElement);
            });
        }
    }

    $("#warranty-detail").click( async function () {
        var inputValue = document.getElementById("warranty_QR").value;
        accessDevice(inputValue);
    })

    async function accessDevice(inputValue) {
        if (inputValue == null || inputValue == "") {
            toastr.error("Vui lòng nhập mã QRcode!");
        } else {
            
            let dataWarranty = [];
            const dataQRcode = await getDM("DM_QRCODE", "1=1")
            const matchedItem = dataQRcode.data.find(item => 
                item.QR_CODE.slice(-9).replace(/\./g, '') === inputValue.replace(/\./g, '')
            );
            if(matchedItem != undefined){
                dataWarranty.push(matchedItem);
            }
            if(dataWarranty.length == 1){
                $("#loading-popup").show()
                let checkQRcode = dataWarranty[0].QR_CODE.split(',');
                const dataQRProduct = await getDataMDQRcode(dataWarranty[0].QR_CODE.replaceAll(',', '$'));
                document.getElementById("result-product").classList.remove("d-none");
                document.getElementById("result-form-loading").classList.add("d-none");
                document.getElementById("result-form").classList.remove("d-none");
                document.getElementById("footer-instruct-scanQR").classList.remove("d-none");
                document.getElementById("result-product-truycap").disabled = false;
                document.getElementById("result-form-productName").value = checkQRcode[1];
                document.getElementById("result-form-productCode").value = checkQRcode[2].substring(1);
                document.getElementById("header-productName").textContent = checkQRcode[1]+" - "+checkQRcode[2].substring(1);
                changeDataWarranty(dataQRProduct);
                DetailProduct();
            } else {
                toastr.error("Sản phẩm không tồn tại hoặc chưa được thêm vào hệ thống")
            }
        }
    }
    
    function WarrantyCheckUser(ROLE) {
        switch (ROLE) {
            case "GUEST":
                $(".warranty_scansQRcode").addClass("d-none");
                // document.getElementById('result-product-warranty').classList.add('hidden');
                $("#lotProduct").addClass("d-none");
                $(".warranty_lot").addClass("d-none");
                break;
            case "DISTRIBUTIVE":
                // $("#lotProduct").add("d-none");
                $(".warranty_lot").addClass("d-none");
                $(".warranty_scansQRcode").addClass("d-none");
                break;
            default:
                break;
        }
    }
    //-----------------------------------------------------------------------------------------------------------

    // code gauge nhiệt độ
    function loadGauge(params) {
        var xmlns = "http://www.w3.org/2000/svg",
        xlinkns = "http://www.w3.org/1999/xlink",
        select = function (s) {
            return document.querySelector(s);
        },
        selectAll = function (s) {
            return document.querySelectorAll(s);
        },
        liquid = selectAll('.liquid'),
        tubeShine = select('.tubeShine'),
        label = select('.label'),
        follower = select('.follower'),
        dragger = select('.dragger'),
        dragTip = select('.dragTip'),
        minDragY = -380,
        liquidId = 0,
        step = Math.abs(minDragY / 50),
        snap = Math.abs(minDragY / 10),
        followerVY = 0;

    gsap.set('svg', { visibility: 'visible' });
    gsap.set(dragTip, { transformOrigin: '20% 50%' });

    var tl = gsap.timeline();
    tl.to(liquid, { x: '-=200', ease: 'none', repeat: -1, stagger: 0.9 });

    tl.time(100);

    document.addEventListener('touchmove', function (event) {
        event.preventDefault();
    });

    Draggable.create(dragger, {
        type: 'y',
        bounds: { minY: minDragY, maxY: 0 },
        onDrag: onUpdate,
        throwProps: true,
        throwResistance: 2300,
        onThrowUpdate: onUpdate,
        overshootTolerance: 0,
        snap: function (value) {
            // Optional: snap to steps of 10
            // return Math.round(value / snap) * snap;
        }
    });

    function onUpdate() {
        // Get the current y position of the dragger using gsap.getProperty
        var draggerY = gsap.getProperty(dragger, 'y');
        liquidId = Math.abs(Math.round(draggerY / step));
        label.textContent = liquidId + '°C';;

        gsap.to(liquid, {
            y: draggerY * 1.12,
            ease: 'elastic.out(1, 0.4)',
            duration: 1.3
        });
    }

    gsap.to(follower, {
        y: '+=0',
        repeat: -1,
        duration: 1,
        modifiers: {
            y: function (y) {
                var draggerY = gsap.getProperty(dragger, 'y');
                followerVY += (draggerY - gsap.getProperty(follower, 'y')) * 0.23;
                followerVY *= 0.69;
                return gsap.getProperty(follower, 'y') + followerVY;
            }
        }
    });

    gsap.to(dragTip, {
        rotation: '+=0',
        repeat: -1,
        duration: 1,
        modifiers: {
            rotation: function (rotation) {
                return rotation - followerVY;
            }
        }
    });

    gsap.to(label, {
        y: '+=0',
        repeat: -1,
        duration: 1,
        modifiers: {
            y: function (y) {
                return y - followerVY * 0.5;
            }
        }
    });

    gsap.to(dragger, {
        y: minDragY / 2,
        onUpdate: onUpdate,
        ease: 'expo.inOut',
        duration: 1.4
    });
    function setRangeValue(value, type) {
        // Chuyển đổi giá trị value từ 0-100 thành vị trí y tương ứng
        var newY
        if (type == 'success') {
            newY = value * (minDragY / 50);
        } else {
            newY = 1 * (minDragY / 50);
        }


        // Cập nhật vị trí của dragger và các phần liên quan
        gsap.to(dragger, {
            y: newY,
            onUpdate: onUpdate, // Gọi lại onUpdate để cập nhật các phần khác
            ease: "expo.inOut",
            duration: 1.0 // Tốc độ di chuyển
        });
    }
    }
    
});