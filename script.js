let map;
let marker;
let circle; // Круг для отображения радиуса
let selectedLat = 55.808234713666174; // Начальные координаты (по умолчанию)
let selectedLng = 38.43791868793516;
let currentZoom = 13; // Начальный уровень зума
let currentData = []; // Для хранения данных
let selectedParams = []; // Выбранные параметры поиска
let availableParams = ["школа", "сад", "лагерь"]; // Доступные параметры

// Инициализация карты
function initMap() {
    map = L.map('map').setView([selectedLat, selectedLng], currentZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Добавление маркера
    marker = L.marker([selectedLat, selectedLng], { draggable: true }).addTo(map);

    // Добавление круга для отображения радиуса
    const radiusInput = document.getElementById("radius");
    const radius = parseFloat(radiusInput.value) * 1000; // Переводим км в метры
    circle = L.circle([selectedLat, selectedLng], {
        radius: radius,
        color: '#007bff',
        fillColor: '#007bff',
        fillOpacity: 0.2
    }).addTo(map);

    // Обновление координат при перемещении маркера
    marker.on('dragend', function (event) {
        const position = marker.getLatLng();
        selectedLat = position.lat;
        selectedLng = position.lng;
        updateCircle(); // Обновляем круг
        console.log("Новые координаты:", selectedLat, selectedLng);
    });

    // Обновление координат при клике на карту
    map.on('click', function (event) {
        const { lat, lng } = event.latlng;
        selectedLat = lat;
        selectedLng = lng;
        marker.setLatLng([lat, lng]);
        updateCircle(); // Обновляем круг
        console.log("Новые координаты:", selectedLat, selectedLng);
    });
}

// Инициализация карты при загрузке страницы
document.addEventListener("DOMContentLoaded", initMap);

// Функция для обновления круга
function updateCircle() {
    const radiusInput = document.getElementById("radius");
    const radius = parseFloat(radiusInput.value) * 1000; // Переводим км в метры
    circle.setLatLng([selectedLat, selectedLng]);
    circle.setRadius(radius);
}

// Функция для применения радиуса
document.getElementById("applyRadius").addEventListener("click", applyRadius);

// Функция для применения количества школ
document.getElementById("applyLimit").addEventListener("click", applyLimit);

// Функция для изменения радиуса колесом мыши
document.getElementById("radius").addEventListener("wheel", (event) => {
    event.preventDefault();
    const radiusInput = document.getElementById("radius");
    let radius = parseFloat(radiusInput.value);

    if (event.deltaY < 0) {
        radius = Math.min(radius + 1, 50); // Увеличить радиус
    } else {
        radius = Math.max(radius - 1, 1); // Уменьшить радиус
    }

    radiusInput.value = radius;
    applyRadius();
});

// Функция для изменения количества школ колесом мыши
document.getElementById("limit").addEventListener("wheel", (event) => {
    event.preventDefault();
    const limitInput = document.getElementById("limit");
    let limit = parseFloat(limitInput.value);

    if (event.deltaY < 0) {
        limit = Math.min(limit + 1, 50); // Увеличить количество
    } else {
        limit = Math.max(limit - 1, 1); // Уменьшить количество
    }

    limitInput.value = limit;
    applyLimit();
});

// Функция для применения радиуса
function applyRadius() {
    const radiusInput = document.getElementById("radius");
    const errorElement = document.getElementById("error");
    const radius = parseFloat(radiusInput.value);

    // Проверка на ввод нуля или отрицательного значения
    if (radius <= 0) {
        errorElement.textContent = "Ошибка: радиус должен быть больше нуля.";
        errorElement.style.display = "block";
        return;
    }

    // Проверка на ввод слишком большого значения (>50 км)
    if (radius > 50) {
        errorElement.textContent = "Ошибка: радиус не может быть больше 50 км.";
        errorElement.style.display = "block";
        return;
    }

    // Скрыть сообщение об ошибке, если оно было показано
    errorElement.style.display = "none";

    // Преобразование радиуса в уровень зума
    currentZoom = radiusToZoom(radius);
    map.setZoom(currentZoom); // Обновление зума карты
    updateCircle(); // Обновляем круг
    console.log("Установлен радиус:", radius, "км, zoom:", currentZoom);
}

// Функция для применения количества школ
function applyLimit() {
    const limitInput = document.getElementById("limit");
    const limit = parseFloat(limitInput.value);
    console.log("Установлено количество школ:", limit);
}

// Функция для преобразования радиуса в уровень зума
function radiusToZoom(radius) {
    // Эмпирическая формула для преобразования радиуса в zoom
    if (radius <= 1) return 15;
    if (radius <= 2) return 14;
    if (radius <= 5) return 13;
    if (radius <= 10) return 12;
    if (radius <= 20) return 11;
    if (radius <= 50) return 10;
    return 10; // Минимальный zoom для больших радиусов
}

// Функция для расчета расстояния между двумя точками (в км)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Радиус Земли в км
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Расстояние в км
}

// Функция для расчета азимута между двумя точками
function calculateAzimuth(lat1, lon1, lat2, lon2) {
    const lat1Rad = lat1 * (Math.PI / 180);
    const lon1Rad = lon1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);
    const lon2Rad = lon2 * (Math.PI / 180);

    const dLon = lon2Rad - lon1Rad;
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    const azimuth = Math.atan2(y, x) * (180 / Math.PI);

    return (azimuth + 360) % 360; // Нормализуем азимут в диапазоне [0, 360)
}

// Функция для определения направления по азимуту
function getDirection(azimuth) {
    const directions = [
        { range: [0, 22.5], emoji: "⬆️", name: "Север" },
        { range: [22.5, 67.5], emoji: "↗️", name: "Северо-Восток" },
        { range: [67.5, 112.5], emoji: "➡️", name: "Восток" },
        { range: [112.5, 157.5], emoji: "↘️", name: "Юго-Восток" },
        { range: [157.5, 202.5], emoji: "⬇️", name: "Юг" },
        { range: [202.5, 247.5], emoji: "↙️", name: "Юго-Запад" },
        { range: [247.5, 292.5], emoji: "⬅️", name: "Запад" },
        { range: [292.5, 337.5], emoji: "↖️", name: "Северо-Запад" },
        { range: [337.5, 360], emoji: "⬆️", name: "Север" }
    ];

    for (const dir of directions) {
        if (azimuth >= dir.range[0] && azimuth < dir.range[1]) {
            return dir;
        }
    }
    return { emoji: "⬆️", name: "Север" }; // По умолчанию
}

// Функция для получения данных
document.getElementById("fetchData").addEventListener("click", async () => {
    const apiUrl = "https://local-business-data.p.rapidapi.com/search";
    const headers = {
        "x-rapidapi-key": "ad55ac066emshfbfeb2df67cde49p17f4fcjsnee711253aa4f", // Новый API-ключ
        "x-rapidapi-host": "local-business-data.p.rapidapi.com"
    };

    // Получаем значение количества школ
    const limitInput = document.getElementById("limit");
    const limit = limitInput.value;

    // Формируем запрос на основе выбранных параметров
    const query = selectedParams.length > 0 ? selectedParams.join(" OR ") : "школа OR сад OR лагерь";

    const params = {
        query: query,
        limit: limit, // Используем выбранное количество школ
        region: "ru",
        language: "ru",
        lat: selectedLat,
        lng: selectedLng,
        zoom: currentZoom // Используем текущий уровень зума
    };

    try {
        const response = await fetch(`${apiUrl}?${new URLSearchParams(params)}`, { headers });
        const data = await response.json();
        currentData = data.data; // Сохраняем данные
        displayResults(currentData);

        // Активируем кнопку "Скачать CSV"
        const downloadButton = document.getElementById("downloadCSV");
        downloadButton.disabled = false;
        downloadButton.style.backgroundColor = "#28a745"; // Зеленый цвет
    } catch (error) {
        console.error("Ошибка при запросе к API:", error);
    }
});

// Функция для скачивания CSV
document.getElementById("downloadCSV").addEventListener("click", () => {
    if (currentData.length === 0) {
        alert("Нет данных для скачивания.");
        return;
    }
    exportToCSV(currentData);
});

// Функция для экспорта данных в CSV
function exportToCSV(data) {
    const BOM = "\uFEFF"; // Добавляем BOM для правильной кодировки
    const csvContent = "data:text/csv;charset=utf-8," +
        BOM +
        "Название,Адрес,Телефон,Email,Сайт,Тип,Город\n" +
        data.map(item => [
            `"${item.name}"`,
            `"${item.full_address || "Не указан"}"`,
            `"${item.phone || "Не указан"}"`,
            `"${item.email || "Не указан"}"`,
            `"${item.website || "Не указан"}"`,
            `"${determineType(item.name)}"`,
            `"${item.city || "Не указан"}"`
        ].join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "schools_and_kindergartens.csv");
    document.body.appendChild(link);
    link.click(); // Автоматическое скачивание файла
    document.body.removeChild(link);
}

// Функция для отображения результатов
function displayResults(results) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (!results || results.length === 0) {
        resultsDiv.innerHTML = "<p>Данные не найдены.</p>";
        return;
    }

    const filteredResults = results.filter(result => {
        const name = result.name.toLowerCase();
        const excludeWords = [
            "автошкола", "колледж", "университет", "институт", "техникум",
            "вуз", "академия", "училище", "авто", "спортивная школа",
            "музыкальная школа", "художественная школа", "фотоальбом",
            "фотостудия", "фото", "альбом", "фотограф", "фотосъемка",
            "фотоуслуги", "фотосессия", "видеосъемка"
        ];
        const includeWords = selectedParams.length > 0 ? selectedParams : ["школа", "сад", "лагерь"];

        return !excludeWords.some(word => name.includes(word)) &&
               includeWords.some(word => name.includes(word));
    });

    if (filteredResults.length === 0) {
        resultsDiv.innerHTML = "<p>Подходящие учреждения не найдены.</p>";
        return;
    }

    const table = document.createElement("table");
    table.innerHTML = `
        <tr>
            <th>Название</th>
            <th>Адрес</th>
            <th>Телефон</th>
            <th>Email</th>
            <th>Сайт</th>
            <th>Тип</th>
            <th>Город</th>
            <th>Расстояние (км)</th>
        </tr>
    `;

    filteredResults.forEach(result => {
        const row = document.createElement("tr");
        const distance = calculateDistance(selectedLat, selectedLng, result.latitude, result.longitude).toFixed(2);
        const website = result.website ? `<a href="${result.website}" target="_blank">${result.website}</a>` : "Не указан";
        
                // Рассчитываем азимут и направление
        const azimuth = calculateAzimuth(selectedLat, selectedLng, result.latitude, result.longitude);
        const direction = getDirection(azimuth);

        // Добавляем стрелочку направления после расстояния
        const distanceWithArrow = `${distance} км ${direction.emoji}`;

        row.innerHTML = `
            <td>${result.name}</td>
            <td>${result.full_address || "Не указан"}</td>
            <td>${result.phone || "Не указан"}</td>
            <td>${result.email || "Не указан"}</td>
            <td>${website}</td>
            <td>${determineType(result.name)}</td>
            <td>${result.city || "Не указан"}</td>
            <td>${distanceWithArrow}</td>
        `;
        table.appendChild(row);
    });

    resultsDiv.appendChild(table);
}

// Функция для определения типа учреждения
function determineType(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("школа") || nameLower.includes("гимназия") || nameLower.includes("лицей")) {
        return "Школа";
    } else if (nameLower.includes("детский сад") || nameLower.includes("сад")) {
        return "Сад";
    } else if (nameLower.includes("лагерь")) {
        return "Лагерь";
    }
    return "Неизвестно";
}

let selectedParams = ["школа", "сад", "лагерь"]; // По умолчанию выбраны все параметры
let availableParams = []; // Изначально доступных параметров нет

// Функция для обновления отображения выбранных параметров
function updateParamsDisplay() {
    const paramsDisplay = document.getElementById("paramsDisplay");
    paramsDisplay.innerHTML = ""; // Очищаем текущее отображение

    selectedParams.forEach(param => {
        const paramElement = document.createElement("span");
        paramElement.style.marginRight = "10px";
        paramElement.style.display = "inline-block";
        paramElement.style.padding = "5px";
        paramElement.style.backgroundColor = "#f0f0f0";
        paramElement.style.borderRadius = "5px";

        // Текст параметра
        const paramText = document.createElement("span");
        paramText.textContent = param;
        paramElement.appendChild(paramText);

        // Крестик для удаления
        const removeButton = document.createElement("span");
        removeButton.textContent = " ❌";
        removeButton.style.cursor = "pointer";
        removeButton.style.color = "red";
        removeButton.addEventListener("click", () => {
            removeParam(param); // Удаляем параметр
        });
        paramElement.appendChild(removeButton);

        paramsDisplay.appendChild(paramElement);
    });

    // Если параметров нет, отображаем сообщение
    if (selectedParams.length === 0) {
        paramsDisplay.textContent = "Нет выбранных параметров";
    }
}

// Функция для удаления параметра
function removeParam(param) {
    selectedParams = selectedParams.filter(p => p !== param); // Удаляем параметр из выбранных
    availableParams.push(param); // Возвращаем параметр в доступные
    updateParamsDisplay(); // Обновляем отображение
}

// Функция для выбора параметров поиска
document.getElementById("selectParams").addEventListener("click", () => {
    if (availableParams.length === 0) {
        alert("Все параметры уже выбраны.");
        return;
    }

    // Создаем модальное окно для выбора параметров
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.backgroundColor = "white";
    modal.style.padding = "20px";
    modal.style.border = "1px solid #ccc";
    modal.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
    modal.style.zIndex = "1000";

    // Добавляем заголовок
    const title = document.createElement("h3");
    title.textContent = "Выберите параметр поиска:";
    modal.appendChild(title);

    // Добавляем кнопки для каждого доступного параметра
    availableParams.forEach(param => {
        const button = document.createElement("button");
        button.textContent = param;
        button.style.margin = "5px";
        button.style.padding = "10px";
        button.style.cursor = "pointer";
        button.addEventListener("click", () => {
            selectedParams.push(param); // Добавляем выбранный параметр
            availableParams = availableParams.filter(p => p !== param); // Удаляем его из доступных
            updateParamsDisplay(); // Обновляем отображение выбранных параметров
            document.body.removeChild(modal); // Закрываем модальное окно
        });
        modal.appendChild(button);
    });

    // Добавляем модальное окно на страницу
    document.body.appendChild(modal);
});

// Функция для сброса параметров поиска
document.getElementById("resetParams").addEventListener("click", () => {
    selectedParams = ["школа", "сад", "лагерь"]; // Восстанавливаем все параметры
    availableParams = []; // Очищаем доступные параметры
    updateParamsDisplay(); // Обновляем отображение
});

// Инициализация отображения параметров при загрузке страницы
updateParamsDisplay();
