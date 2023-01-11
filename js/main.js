const API_KEY = 'aabd4739-6934-4171-8805-bdcf1ee1eef8';
const ROUTES_PER_PAGE = 10;
const GUIDES_PER_PAGE = 5;

var routeCurrentPage = 1;
var routeTotalPages;
var routeList = [];
var filteredRouteList = [];
var currentSearchMainSubject = null;
var currentSearchName = null;

var guideCurrentPage = 1;
var guideTotalPages;
var guideList = [];
var filteredGuideList = [];
var currentSearchGuideLanguage = null;
var currentSearchExperienceFrom = null;
var currentSearchExperienceTo = null;

function sendGet(url, callback) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.responseType = 'json';

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                callback(xmlhttp.response);
            } else {
                console.log('Ошибка запроса');
            }
        }
    };

    xmlhttp.open("GET", `${url}?api_key=${API_KEY}`, true);
    xmlhttp.send();
}

function sendCUD(url, callback, formData = new FormData, method = 'POST') {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.responseType = 'json';

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                callback(xmlhttp.response);
            } else {
                console.log('Ошибка запроса');
            }
        }
    };

    xmlhttp.open(method, url, true);
    if (formData == null) {
        formData = new FormData();
    }
    formData.append('api_key', API_KEY);
    xmlhttp.send(formData);
}

// Получение списка маршрутов
function getRouteList() {
    sendGet('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes', function (response) {
        routeTotalPages = Math.ceil(response.length / ROUTES_PER_PAGE);
        routeCurrentPage = 1;
        routeList = response;
        filteredRouteList = response;

        let select = document.getElementById('mainObjectsSelect');
        let mainObjects = response.map((item) => item.mainObject);
        for (let mainObject of mainObjects) {
            let option = document.createElement('option');
            option.value = mainObject;
            option.innerHTML = mainObject;
            select.append(option);
        }
        goToRoutesPage(1);
    });
}

// Получение списка гидов
function getGuidesList(routeId) {
    sendGet(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/${routeId}/guides`, function (response) {
        console.log(response);
        guideTotalPages = Math.ceil(response.length / GUIDES_PER_PAGE);
        guideCurrentPage = 1;
        guideList = response;
        filteredGuideList = response;

        let select = document.getElementById('excursionLanguage');
        let languages = response.map((item) => item.language);
        let usedLanguages = [];
        for (let language of languages) {
            if (usedLanguages.includes(language)) {
                continue;
            }
            let option = document.createElement('option');
            option.value = language;
            option.innerHTML = language;
            select.append(option);
            usedLanguages.push(language);
        }
        goToGuidesPage(1);
    });
}

// Фильтрация маршрутов по куску строки
function filterRoutes() {
    let newRoutes = [];
    if (currentSearchName === null || currentSearchName === '') {
        newRoutes = routeList;
    } else {
        let name = currentSearchName.toLowerCase().trim();
        for (let i = 0; i < routeList.length; i++) {
            let route = routeList[i];
            let routeName = route.name.toLowerCase();
            let description = route.description.toLowerCase();
            if (routeName.includes(name) || description.includes(name)) {
                newRoutes.push(route);
            }
        }
    }

    let newRoutes2 = [];
    if (currentSearchMainSubject === null || currentSearchMainSubject === '') {
        newRoutes2 = newRoutes;
    } else {
        let name = currentSearchMainSubject.toLowerCase().trim();
        for (let i = 0; i < newRoutes.length; i++) {
            let route = newRoutes[i];
            let mainSubject = route.mainObject.toLowerCase();
            if (mainSubject.includes(name)) {
                newRoutes2.push(route);
            }
        }
    }
    filteredRouteList = newRoutes2;
    routeTotalPages = Math.ceil(filteredRouteList.length / ROUTES_PER_PAGE);
    if (routeTotalPages === 0) {
        routeTotalPages = 1;
    }
    routeCurrentPage = 1;
    goToRoutesPage(1);
    renderRoutePaginationElement();
}

// Добавление маршрута в таблицу
function addRouteToTable(id, name, description, mainObject) {
    let table = document.getElementById('routeTable').children[0];

    let fullName = name;
    name = makeShorter(name, 50);
    description = makeShorter(description, 50);
    mainObject = makeShorter(mainObject, 50);

    let tr = document.createElement('tr');
    let nameTd = document.createElement('td');
    nameTd.innerHTML = name;
    let descriptionTd = document.createElement('td');
    descriptionTd.innerHTML = description;
    let objectsTd = document.createElement('td');
    objectsTd.innerHTML = mainObject;
    let buttonTd = document.createElement('td');
    let buttonChose = document.createElement('button');
    buttonChose.innerHTML = 'Выбрать';
    buttonChose.onclick = function (ev) {
        let tr = ev.target.parentElement.parentElement;
        if (tr.style.background) {
            tr.style.background = '';
            hideGuideSection();
        } else {
            let otherRows = document.getElementById('routeTable').children[0].children;
            for (let i = 1; i < otherRows.length; i++) {
                otherRows[i].style.background = '';
            }
            tr.style.background = '#8fff55';
            showGuideSection(fullName);
            getGuidesList(id);
        }
    }
    buttonTd.append(buttonChose);
    tr.append(nameTd, descriptionTd, objectsTd, buttonTd);
    table.append(tr);
}

// Добавление маршрута в таблицу
function addGuideToTable(id, language, name, price, experience) {
    let table = document.getElementById('guidesTable').children[0];

    let tr = document.createElement('tr');
    let avatarTd = document.createElement('td');
    let nameTd = document.createElement('td');
    nameTd.innerHTML = name;
    let languagesTd = document.createElement('td');
    languagesTd.innerHTML = language;
    let experienceTd = document.createElement('td');
    experienceTd.innerHTML = experience;
    let priceTd = document.createElement('td');
    priceTd.innerHTML = price;
    let buttonTd = document.createElement('td');
    let buttonChose = document.createElement('button');
    buttonChose.innerHTML = 'Выбрать';
    buttonChose.onclick = function (ev) {
        console.log(id);
        // let tr = ev.target.parentElement.parentElement;
        // if (tr.style.background) {
        //     tr.style.background = '';
        //     hideGuideSection();
        // } else {
        //     let otherRows = document.getElementById('routeTable').children[0].children;
        //     for (let i = 1; i < otherRows.length; i++) {
        //         otherRows[i].style.background = '';
        //     }
        //     tr.style.background = '#8fff55';
        //     showGuideSection(fullName);
        //     getGuidesList(id);
        // }
    }
    buttonTd.append(buttonChose);
    tr.append(avatarTd, nameTd, languagesTd, experienceTd, priceTd, buttonTd);
    table.append(tr);
}

// Показать секцию с гидами
function showGuideSection(routeName) {
    document.getElementById('guideSection').style.display = 'block';
    document.getElementById('chosenRouteName').innerHTML = routeName;
}

// Скрыть секцию с гидами
function hideGuideSection() {
    document.getElementById('guideSection').style.visibility = 'none';
    document.getElementById('chosenRouteName').innerHTML = '';
}

function clearRouteTable() {
    let table = document.getElementById('routeTable');
    let titles = table.children[0].children[0];
    table.children[0].innerHTML = '';
    table.children[0].append(titles);
}

function clearGuidesTable() {
    let table = document.getElementById('guidesTable');
    let titles = table.children[0].children[0];
    table.children[0].innerHTML = '';
    table.children[0].append(titles);
}

// Укоротить строку и добавить точки
function makeShorter(str, maxLength) {
    if (str.length >= maxLength) {
        return `${str.substring(0, maxLength)}...`
    }
    return str;
}

// Получение списка заявок
function getOrderList() {
    sendGet('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders', function (response) {

    });
}

// Создание заявки
function createOrder(guideId, routeId, date, time, duration, persons, price) {
    let formData = new FormData();
    formData.append('guide_id', guideId);
    formData.append('route_id', routeId);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('duration', duration);
    formData.append('persons', persons);
    formData.append('price', price);
    sendCUD('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders', function (response) {

    }, formData);
}

// Обновление заявки
function updateOrder(
    orderId,
    routeId = null,
    date = null,
    time = null,
    duration = null,
    persons = null,
    price = null
) {
    let formData = new FormData();
    formData.append('guide_id', guideId);
    formData.append('route_id', routeId);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('duration', duration);
    formData.append('persons', persons);
    formData.append('price', price);
    sendCUD(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders/${orderId}`, function (response) {

    }, formData, 'PUT');
}

// Удаление заявки
function deleteOrder(orderId) {
    sendCUD(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders/${orderId}`, function (response) {

    }, null, 'DELETE');
}

// Получение заявки
function getOrder(orderId) {
    sendGet(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders/${orderId}`, function (response) {

    });
}

// Получение информации о гиде
function getGuide(guideId) {
    sendGet(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/guides/${guideId}`, function (response) {

    });
}

function routeSearchEvent(event) {
    currentSearchName = event.value;
    filterRoutes();
}

function mainSubjectFilterPick(event) {
    let mainSubject = event.value;
    if (mainSubject === 'none') {
        currentSearchMainSubject = null;
    } else {
        currentSearchMainSubject = mainSubject;
    }
    filterRoutes();
}

// Рендер навигационных кнопок для пагинации
function renderRoutePaginationElement() {
    let paginationContainer = document.getElementById('paginationRoutes')
    paginationContainer.innerHTML = '';
    let btn = createPageBtn(1, ['first-page-btn']);
    btn.onclick = () => goToRoutesPage(1);
    btn.innerHTML = 'Первая страница';
    if (routeCurrentPage === 1) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);

    let buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('pages-btns');
    paginationContainer.append(buttonsContainer);

    let start = Math.max(routeCurrentPage - 2, 1);
    let end = Math.min(routeCurrentPage + 2, routeTotalPages);
    for (let i = start; i <= end; i++) {
        buttonsContainer.append(createPageBtn(i, i === routeCurrentPage ? ['active'] : []));
    }

    btn = createPageBtn(routeTotalPages, ['last-page-btn']);
    btn.onclick = () => goToRoutesPage(routeTotalPages);
    btn.innerHTML = 'Последняя страница';
    if (routeCurrentPage === routeTotalPages) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);
}

// Рендер навигационных кнопок для пагинации для гидов
function renderGuidePaginationElement() {
    let paginationContainer = document.getElementById('paginationGuides');
    paginationContainer.innerHTML = '';
    let btn = createPageBtn(1, ['first-page-btn']);
    btn.onclick = () => goToGuidesPage(1);
    btn.innerHTML = 'Первая страница';
    if (guideCurrentPage === 1) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);

    let buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('pages-btns');
    paginationContainer.append(buttonsContainer);

    let start = Math.max(guideCurrentPage - 2, 1);
    let end = Math.min(guideCurrentPage + 2, guideTotalPages);
    for (let i = start; i <= end; i++) {
        buttonsContainer.append(createPageBtn(i, i === guideCurrentPage ? ['active'] : []));
    }

    btn = createPageBtn(guideTotalPages, ['last-page-btn']);
    btn.onclick = () => goToGuidesPage(guideTotalPages);
    btn.innerHTML = 'Последняя страница';
    if (guideCurrentPage === guideTotalPages) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);
}

function goToRoutesPage(page) {
    let totalPages = Math.ceil(filteredRouteList.length / ROUTES_PER_PAGE);
    clearRouteTable();
    if (page < 1 || page > totalPages) {
        return;
    }
    for (let i = (page - 1) * ROUTES_PER_PAGE; i < page * ROUTES_PER_PAGE && i < filteredRouteList.length; i++) {
        addRouteToTable(
            filteredRouteList[i].id,
            filteredRouteList[i].name,
            filteredRouteList[i].description,
            filteredRouteList[i].mainObject
        );
    }
    routeCurrentPage = page;
    renderRoutePaginationElement();
}

function goToGuidesPage(page) {
    let totalPages = Math.ceil(filteredGuideList.length / GUIDES_PER_PAGE);
    clearGuidesTable();
    if (page < 1 || page > totalPages) {
        return;
    }
    for (let i = (page - 1) * GUIDES_PER_PAGE; i < page * GUIDES_PER_PAGE && i < filteredGuideList.length; i++) {
        addGuideToTable(
            filteredRouteList[i].id,
            filteredRouteList[i].language,
            filteredRouteList[i].name,
            filteredRouteList[i].pricePerHour,
            filteredRouteList[i].workExperience
        );
    }
    guideCurrentPage = page;
    renderGuidePaginationElement();
}

// создание кнопки
function createPageBtn(page, classes = []) {
    let btn = document.createElement('button');
    classes.push('btn');
    for (let cls of classes) {
        btn.classList.add(cls);
    }
    btn.onclick = () => goToRoutesPage(page);
    btn.innerHTML = page;
    return btn;
}

getRouteList();