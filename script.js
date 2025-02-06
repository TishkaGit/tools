let map;
let marker;
let selectedLat = 55.808234713666174; // Начальные координаты (по умолчанию)
let selectedLng = 38.43791868793516;
let currentZoom = 13; // Начальный уровень зума
let currentData = []; // Для хранения данных

// Инициализация карты
function initMap() {
    map = L.map('map').setView([selectedLat, selectedLng], currentZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Добавление маркера
    marker = L.marker([selectedLat, selectedLng], { draggable: true }).addTo(map);

    // Обновление координат при перемещении маркера
    marker.on('dragend', function (event) {
        const position = marker.getLatLng();
        selectedLat = position.lat;
        selectedLng = position.lng;
        console.log("Новые координаты:", selectedLat, selectedLng);
    });

    // Обновление координат при клике на карту
    map.on('click', function (event) {
        const { lat, lng } = event.latlng;
        selectedLat = lat;
        selectedLng = lng;
        marker.setLatLng([lat, lng]);
        console.log("Новые координаты:", selectedLat, selectedLng);
    });
}

// Инициализация карты при загрузке страницы
document.addEventListener("DOMContentLoaded", initMap);

// Функция для применения радиуса
document.getElementById("applyRadius").addEventListener("click", () => {
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
    console.log("Установлен радиус:", radius, "км, zoom:", currentZoom);
});

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

// Функция для получения данных
document.getElementById("fetchData").addEventListener("click", async () => {
    const apiUrl = "https://local-business-data.p.rapidapi.com/search";
    const headers = {
        "x-rapidapi-key": "93c2e38741mshcc05d99b12d83f8p1bc802jsn90e46c100107",
        "x-rapidapi-host": "local-business-data.p.rapidapi.com"
    };

    // Получаем значение количества школ
    const limitInput = document.getElementById("limit");
    const limit = limitInput.value;

    const params = {
        query: "school OR kindergarten OR camp OR лагерь",
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
    const csvContent = "data:text/csv;charset=utf-8," +
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
        const includeWords = ["школа", "гимназия", "лицей", "детский сад", "сад", "лагерь"];

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
        </tr>
    `;

    filteredResults.forEach(result => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${result.name}</td>
            <td>${result.full_address || "Не указан"}</td>
            <td>${result.phone || "Не указан"}</td>
            <td>${result.email || "Не указан"}</td>
            <td>${result.website || "Не указан"}</td>
            <td>${determineType(result.name)}</td>
            <td>${result.city || "Не указан"}</td>
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
