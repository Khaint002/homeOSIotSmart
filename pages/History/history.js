var application = localStorage.getItem("application");
var historyListDetail = $('#history-detail');
var checkTabHistory;
var intervalId;
async function pickApp(type) {
    showAddWorkStationButton();
    switch (type) {
        case 'KTTV':
            checkTabHistory = 1;
            showHistory();
            break;

        case 'HISTORY':
            showHistory();
            showElement("history");
            hideElement("homePage");
            break;

        case 'warranty':
            localStorage.setItem("application", "warranty");
            await handleWarrantyApp();
            break;

        case 'CONTROL':
            localStorage.setItem("application", "CONTROL");
            checkApp = type;
            showElement("history");
            hideElement("pickApp");
            runLed7();
            break;
    }
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
        if (checkTabHistory == 1) {
            changeQRcode()
        } else if (checkTabHistory == 2) {
            $(".WarrantyScanNext").click();
        }
    });
    historyListDetail.append(buttonHTML); // Giả sử bạn có một div với id "addWorkStationContainer" để chứa nút này
}

// App history 

let ZONE_PROPERTY = 'RD';
let ZONE_UNIT = ' mm';
let ZONE_PROPERTY_NNS = 'RT';
let ZONE_UNIT_NNS = ' °C';

function getColorByTimeDiff(dateStr) {
    const now = new Date();
    const providedTime = new Date(dateStr);
    const minutesDiff = (now - providedTime) / (1000 * 60);
    return minutesDiff < 15 ? "#28a745" : "#da4a58";
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
            '<div id="Value' + item.CodeWorkStation + '" style="background-color: #1052e7; width: 70px; height: 20px;font-size: 12px;color: #fff; border-radius: 4px 4px 0 0;">-</div>' +
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

            // document.getElementById("RD").textContent = '0 mm';
            // document.getElementById("lastTimeRain").textContent = '';
            HOMEOSAPP.itemHistory = item;
            handleItemClick(item);
        });

        // Thêm phần tử vào danh sách lịch sử

        historyListDetail.append(totalElement);
    }

}

function handleItemClick(item) {
    stopInterval();
    localStorage.setItem("URL", "https://" + item.domain + "/Service/Service.svc");
    // document.getElementById("footer-stationName").textContent = item.CodeWorkStation + " - " + item.NameWorkStation;
    localStorage.setItem("MATRAM", item.CodeWorkStation);
    const itemHistory = { 'CodeWorkStation': item.CodeWorkStation, 'NameWorkStation': item.NameWorkStation, 'domain': item.domain, 'date': HOMEOSAPP.getCurrentTime(), 'workstationType': item.workstationType }
    localStorage.setItem('itemHistory', JSON.stringify(itemHistory));
    $("#loading-popup").show();
    $("#content-block").load("https://home-os-iot-smart.vercel.app/pages/KTTV/kttv.html");
    // truyCap();
}

function stopInterval() {
    // Xóa interval nếu đang chạy
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

async function startInterval() {
    if (intervalId) return;

    for (let i = historyItems.length - 1; i >= 0; i--) {
        const station = historyItems[i];
        const data = await HOMEOSAPP.getNewData(
            station.CodeWorkStation,
            `WORKSTATION_ID='${station.CodeWorkStation}'`,
            `https://${station.domain}/Service/Service.svc`
        );
        await updateWorkstationUI(station, data);
    }

    intervalId = setInterval(async () => {
        rotateProperties();

        for (let i = historyItems.length - 1; i >= 0; i--) {
            const station = historyItems[i];
            const data = await HOMEOSAPP.getNewData(
                station.CodeWorkStation,
                `WORKSTATION_ID='${station.CodeWorkStation}'`,
                `https://${station.domain}/Service/Service.svc`
            );
            await updateWorkstationUI(station, data);
        }
    }, 10000);
}

function rotateProperties() {
    const props = [
        { prop: 'RD', unit: ' mm' },
        { prop: 'RT', unit: ' °C' },
        { prop: 'RH', unit: ' %' },
        { prop: 'RP', unit: ' hPa' }
    ];
    const index = props.findIndex(p => p.prop === ZONE_PROPERTY);
    const next = props[(index + 1) % props.length];
    ZONE_PROPERTY = next.prop;
    ZONE_UNIT = next.unit;

    const nnsProps = [
        { prop: 'RT', unit: ' °C' },
        { prop: 'RN', unit: ' cm' },
        { prop: 'SS', unit: ' ppt' },
        { prop: 'EC', unit: ' μs/cm' }
    ];
    const nnsIndex = nnsProps.findIndex(p => p.prop === ZONE_PROPERTY_NNS);
    const nextNNS = nnsProps[(nnsIndex + 1) % nnsProps.length];
    ZONE_PROPERTY_NNS = nextNNS.prop;
    ZONE_UNIT_NNS = nextNNS.unit;
}

async function updateWorkstationUI(station, data) {
    const filteredItems = data.D.filter(item => item.ZONE_ADDRESS === station.CodeWorkStation);
    const elementValue = document.getElementById('Value' + station.CodeWorkStation);
    const button = document.getElementById('App' + station.CodeWorkStation);

    if (filteredItems.length === 0) {
        if (button) button.style.backgroundColor = "#da4a58";
        return;
    }

    let prop = 'RD';
    if (station.workstationType === "NAAM") prop = ZONE_PROPERTY;
    else if (station.workstationType === "N") prop = 'RN';
    else if (["M", "MS"].includes(station.workstationType)) prop = 'RD';
    else if (station.workstationType === "NNS") prop = ZONE_PROPERTY_NNS;

    const dataRD = filteredItems.find(item => item.ZONE_PROPERTY === prop);
    elementValue.textContent = dataRD ? getDisplayValue(dataRD, station.workstationType) : '_';
    if(station.workstationType === "NNS"){
        dataRD
    }
    if(prop == 'RD' && !dataRD){
        elementValue.textContent = "0mm";
    }
    try {
        const dataRA = filteredItems.find(item => item.ZONE_PROPERTY === 'RA');
        if (dataRA) {
            const color = getColorByTimeDiff(dataRA.DATE_CREATE);
            if (button) button.style.backgroundColor = color;
        } else {
            if (button) button.style.backgroundColor = "#da4a58";
        }
    } catch (e) {
        if (button) button.style.backgroundColor = "#da4a58";
    }
}

function showHistory(type) {
    const historySetting = document.getElementById("history-setting");
    const historyHomePage = document.getElementById("history-homePage");
    const historySelect = document.getElementById("historySelect");

    if (type === "ADD") {
        historySetting.classList.remove("d-none");
        historyHomePage.classList.add("d-none");
        OpenAddCategory();
        return;
    }

    historyItems = JSON.parse(localStorage.getItem('dataHistory')) || [];
    DataCategory = JSON.parse(localStorage.getItem('dataCategory')) || [];
    const arrayCategory = ["ADD"];

    // Tạo danh sách tên danh mục không trùng
    DataCategory.forEach(cat => {
        if (!arrayCategory.includes(cat.NameCategory)) {
            arrayCategory.push(cat.NameCategory);
        }
    });

    if (type) {
        const categoryMatched = DataCategory.find(cat => cat.NameCategory === type);

        if (type !== "ALL" && !categoryMatched) {
            historyItems = historyItems.filter(item => item.workstationType === type);
        } else if (categoryMatched && categoryMatched.itemCategory?.length) {
            historyItems = categoryMatched.itemCategory
                .map(catItem => historyItems.find(h => h.CodeWorkStation === catItem.CodeWorkStation))
                .filter(Boolean);
        }
    }

    if (!historyItems || historyItems.length === 0) return;

    // Làm sạch và hiển thị danh sách
    historyListDetail.empty();
    historyItems.forEach(item => {
        addItemHistory(item);
        if (!arrayCategory.includes(item.workstationType)) {
            arrayCategory.push(item.workstationType);
        }
    });

    arrayCategory.push("ALL");

    // Chỉ tạo select nếu chưa có type (tức là lần đầu vào)
    if (!type) {
        historySelect.innerHTML = "";
        arrayCategory.slice().reverse().forEach(cat => {
            const option = document.createElement("option");

            switch (cat) {
                case "NAAM":
                    option.value = cat;
                    option.text = "Trạm Mưa, nhiệt, ẩm, áp";
                    break;
                case "N":
                    option.value = cat;
                    option.text = "Trạm mực nước";
                    break;
                case "M":
                    option.value = cat;
                    option.text = "Trạm Mưa";
                    break;
                case "MS":
                    option.value = cat;
                    option.text = "Trạm Mưa, sóng";
                    break;
                case "NNS":
                    option.value = cat;
                    option.text = "Trạm mặn, nhiệt, mực nước";
                    break;
                case "ALL":
                    option.value = cat;
                    option.text = "Tất cả trạm";
                    break;
                case "ADD":
                    option.value = cat;
                    option.text = " + Thêm danh mục mới";
                    option.className = "custom-option";
                    break;
                default:
                    option.value = cat;
                    option.text = cat;
                    break;
            }

            historySelect.appendChild(option);
        });
    }

    startInterval();
}

function getIconWorkstation(type) {
    switch (type) {
        case "NAAM":
            return '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="color: #fff;" fill="currentColor" viewBox="0 0 640 512"><path d="M294.2 1.2c5.1 2.1 8.7 6.7 9.6 12.1l10.4 62.4c-23.3 10.8-42.9 28.4-56 50.3c-14.6-9-31.8-14.1-50.2-14.1c-53 0-96 43-96 96c0 35.5 19.3 66.6 48 83.2c.8 31.8 13.2 60.7 33.1 82.7l-56 39.2c-4.5 3.2-10.3 3.8-15.4 1.6s-8.7-6.7-9.6-12.1L98.1 317.9 13.4 303.8c-5.4-.9-10-4.5-12.1-9.6s-1.5-10.9 1.6-15.4L52.5 208 2.9 137.2c-3.2-4.5-3.8-10.3-1.6-15.4s6.7-8.7 12.1-9.6L98.1 98.1l14.1-84.7c.9-5.4 4.5-10 9.6-12.1s10.9-1.5 15.4 1.6L208 52.5 278.8 2.9c4.5-3.2 10.3-3.8 15.4-1.6zM208 144c13.8 0 26.7 4.4 37.1 11.9c-1.2 4.1-2.2 8.3-3 12.6c-37.9 14.6-67.2 46.6-77.8 86.4C151.8 243.1 144 226.5 144 208c0-35.3 28.7-64 64-64zm69.4 276c11 7.4 14 22.3 6.7 33.3l-32 48c-7.4 11-22.3 14-33.3 6.7s-14-22.3-6.7-33.3l32-48c7.4-11 22.3-14 33.3-6.7zm96 0c11 7.4 14 22.3 6.7 33.3l-32 48c-7.4 11-22.3 14-33.3 6.7s-14-22.3-6.7-33.3l32-48c7.4-11 22.3-14 33.3-6.7zm96 0c11 7.4 14 22.3 6.7 33.3l-32 48c-7.4 11-22.3 14-33.3 6.7s-14-22.3-6.7-33.3l32-48c7.4-11 22.3-14 33.3-6.7zm96 0c11 7.4 14 22.3 6.7 33.3l-32 48c-7.4 11-22.3 14-33.3 6.7s-14-22.3-6.7-33.3l32-48c7.4-11 22.3-14 33.3-6.7zm74.5-116.1c0 44.2-35.8 80-80 80l-271.9 0c-53 0-96-43-96-96c0-47.6 34.6-87 80-94.6l0-1.3c0-53 43-96 96-96c34.9 0 65.4 18.6 82.2 46.4c13-9.1 28.8-14.4 45.8-14.4c44.2 0 80 35.8 80 80c0 5.9-.6 11.7-1.9 17.2c37.4 6.7 65.8 39.4 65.8 78.7z"/></svg>';
        case "N":
            return '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="color: #fff;" fill="currentColor" class="bi bi-moisture" viewBox="0 0 16 16"><path d="M13.5 0a.5.5 0 0 0 0 1H15v2.75h-.5a.5.5 0 0 0 0 1h.5V7.5h-1.5a.5.5 0 0 0 0 1H15v2.75h-.5a.5.5 0 0 0 0 1h.5V15h-1.5a.5.5 0 0 0 0 1h2a.5.5 0 0 0 .5-.5V.5a.5.5 0 0 0-.5-.5zM7 1.5l.364-.343a.5.5 0 0 0-.728 0l-.002.002-.006.007-.022.023-.08.088a29 29 0 0 0-1.274 1.517c-.769.983-1.714 2.325-2.385 3.727C2.368 7.564 2 8.682 2 9.733 2 12.614 4.212 15 7 15s5-2.386 5-5.267c0-1.05-.368-2.169-.867-3.212-.671-1.402-1.616-2.744-2.385-3.727a29 29 0 0 0-1.354-1.605l-.022-.023-.006-.007-.002-.001zm0 0-.364-.343zm-.016.766L7 2.247l.016.019c.24.274.572.667.944 1.144.611.781 1.32 1.776 1.901 2.827H4.14c.58-1.051 1.29-2.046 1.9-2.827.373-.477.706-.87.945-1.144zM3 9.733c0-.755.244-1.612.638-2.496h6.724c.395.884.638 1.741.638 2.496C11 12.117 9.182 14 7 14s-4-1.883-4-4.267"/></svg>';
        case "M":
            return '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="color: #fff;" fill="currentColor" class="bi bi-cloud-lightning-rain" viewBox="0 0 16 16"><path d="M2.658 11.026a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m9.5 0a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m-7.5 1.5a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m9.5 0a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m-.753-8.499a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 10H13a3 3 0 0 0 .405-5.973M8.5 1a4 4 0 0 1 3.976 3.555.5.5 0 0 0 .5.445H13a2 2 0 0 1 0 4H3.5a2.5 2.5 0 1 1 .605-4.926.5.5 0 0 0 .596-.329A4 4 0 0 1 8.5 1M7.053 11.276A.5.5 0 0 1 7.5 11h1a.5.5 0 0 1 .474.658l-.28.842H9.5a.5.5 0 0 1 .39.812l-2 2.5a.5.5 0 0 1-.875-.433L7.36 14H6.5a.5.5 0 0 1-.447-.724z"/></svg>';
        case "NNS":
            return '<svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" style="color: #fff;" fill="currentColor" class="bi bi-droplet-half" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M7.21.8C7.69.295 8 0 8 0q.164.544.371 1.038c.812 1.946 2.073 3.35 3.197 4.6C12.878 7.096 14 8.345 14 10a6 6 0 0 1-12 0C2 6.668 5.58 2.517 7.21.8m.413 1.021A31 31 0 0 0 5.794 3.99c-.726.95-1.436 2.008-1.96 3.07C3.304 8.133 3 9.138 3 10c0 0 2.5 1.5 5 .5s5-.5 5-.5c0-1.201-.796-2.157-2.181-3.7l-.03-.032C9.75 5.11 8.5 3.72 7.623 1.82z"/><path fill-rule="evenodd" d="M4.553 7.776c.82-1.641 1.717-2.753 2.093-3.13l.708.708c-.29.29-1.128 1.311-1.907 2.87z"/></svg>';
        default:
            return '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="color: #fff;" fill="currentColor" class="bi bi-cloud" viewBox="0 0 16 16"><path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/></svg>';
    }
}

function getDisplayValue(item, type) {
    switch (type) {
        case "NAAM":
            return item.ZONE_VALUE / 10 + ZONE_UNIT;
        case "N":
            return item.ZONE_VALUE + " cm";
        case "M":
        case "MS":
            return item.ZONE_VALUE / 10 + " mm";
        case "NNS":
            if (ZONE_PROPERTY_NNS === "SS") {
                return (item.ZONE_VALUE / 10000).toFixed(2) + ZONE_UNIT_NNS;
            } else if (ZONE_PROPERTY_NNS === "EC") {
                return (item.ZONE_VALUE / 1000).toFixed(2) + ZONE_UNIT_NNS;
            } else if(ZONE_PROPERTY_NNS === "RN") {
                return item.ZONE_VALUE + ZONE_UNIT_NNS;
            } else {
                return item.ZONE_VALUE / 10 + ZONE_UNIT_NNS;
            }
        default:
            return "-";
    }
}
//-------------------------------------------------------------------------------



pickApp(application);