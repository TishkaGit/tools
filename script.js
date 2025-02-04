document.getElementById("fetchData").addEventListener("click", async () => {
    const apiUrl = "https://local-business-data.p.rapidapi.com/search";
    const headers = {
        "x-rapidapi-key": "93c2e38741mshcc05d99b12d83f8p1bc802jsn90e46c100107",
        "x-rapidapi-host": "local-business-data.p.rapidapi.com"
    };
    const params = {
        query: "school OR kindergarten OR camp OR лагерь",
        limit: "5",
        region: "ru",
        language: "ru",
        lat: "55.808234713666174",
        lng: "38.43791868793516",
        zoom: "13"
    };

    try {
        const response = await fetch(`${apiUrl}?${new URLSearchParams(params)}`, { headers });
        const data = await response.json();
        displayResults(data.data);
    } catch (error) {
        console.error("Ошибка при запросе к API:", error);
    }
});

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
