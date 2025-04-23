var application = localStorage.getItem("application");
var historyListDetail = $('#history-detail');
var checkTabHistory;
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
            document.getElementById("RD").textContent = '0 mm';
            document.getElementById("lastTimeRain").textContent = '';
            handleItemClick(item);
        });

        // Thêm phần tử vào danh sách lịch sử

        historyListDetail.append(totalElement);
    }

}

async function startInterval() {
    if (intervalId) return;

    for (let i = historyItems.length - 1; i >= 0; i--) {
        const station = historyItems[i];
        const data = await getNewData(
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
            const data = await getNewData(
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

//-------------------------------------------------------------------------------

pickApp(application);