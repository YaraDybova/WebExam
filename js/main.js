const API_KEY = 'aabd4739-6934-4171-8805-bdcf1ee1eef8';
const API_URL = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru/api';
const ROUTES_PER_PAGE = 10;
const GUIDES_PER_PAGE = 5;

let routeCurrentPage = 1;
let routeTotalPages;
let routeList = [];
let filteredRouteList = [];
let currentSearchMainSubject = null;
let currentSearchName = null;

let guideCurrentPage = 1;
let guideTotalPages;
let guideList = [];
let filteredGuideList = [];
let currentSearchGuideLanguage = null;
let currentSearchExperienceFrom = null;
let currentSearchExperienceTo = null;

let chosenRoute = null;
let chosenGuide = null;

function showOrderError(text) {
    orderError.innerHTML = text;
}

function closeOrderError() {
    orderError.innerHTML = '';
}

function showSuccessMessage(text) {
    document.getElementById('successBlock').style.display = 'flex';
    document.getElementById('successMessage').innerHTML = text;
}

function closeSuccessMessage() {
    document.getElementById('successBlock').style.display = 'none';
    document.getElementById('successMessage').innerHTML = text;
}

function sendGet(url, callback) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.responseType = 'json';

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
            if (xmlhttp.status === 200) {
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
    let request = new XMLHttpRequest();
    request.responseType = 'json';

    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                callback(request.response);
                closeOrderError();
            } else {
                console.log(request.response.error);
                showOrderError(request.response.error);
            }
        }
    };

    request.open(method, `${url}?api_key=${API_KEY}`, true);
    if (formData == null) {
        formData = new FormData();
    }
    formData.append('api_key', API_KEY);
    request.send(formData);
}

function clearRouteTable() {
    let table = document.getElementById('routeTable');
    let titles = table.children[0].children[0];
    table.children[0].innerHTML = '';
    table.children[0].append(titles);
}

// Укоротить строку и добавить точки
function makeShorter(str, maxLength) {
    if (str.length >= maxLength) {
        return `${str.substring(0, maxLength)}...`;
    }
    return str;
}

// Скрыть секцию с гидами
function hideGuideSection() {
    document.getElementById('guideSection').style.display = 'none';
    document.getElementById('chosenRouteName').innerHTML = '';
}

// Показать секцию с гидами
function showGuideSection(routeName) {
    document.getElementById('guideSection').style.display = 'block';
    document.getElementById('chosenRouteName').innerHTML = routeName;
}

function clearGuidesTable() {
    let table = document.getElementById('guidesTable');
    let titles = table.children[0].children[0];
    table.children[0].innerHTML = '';
    table.children[0].append(titles);
}

// Добавление маршрута в таблицу
function addGuideToTable(id, language, name, price, experience) {
    let table = document.getElementById('guidesTable').children[0];

    let tr = document.createElement('tr');
    let avatarTd = document.createElement('td');
    let img = document.createElement('img');
    img.src = 'assets/cat2.jpg';
    img.alt = 'Аватарка';
    img.style.width = '50px';
    img.style.height = '50px';
    avatarTd.append(img);
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
        let tr = ev.target.parentElement.parentElement;
        if (tr.style.background) {
            tr.style.background = '';
            document.getElementById('createOrder').style.visibility = 'hidden';
        } else {
            let otherRows = document.getElementById('guidesTable');
            otherRows = otherRows.children[0].children;
            for (let i = 1; i < otherRows.length; i++) {
                otherRows[i].style.background = '';
            }
            tr.style.background = '#8fff55';
            chosenGuide = {
                id,
                language,
                name,
                price,
                experience
            };
            let routeName = chosenRoute.name;
            document.getElementById('createOrderGuideName').innerHTML = name;
            document.getElementById('createOrderRoute').innerHTML = routeName;
            document.getElementById('createOrder').style.visibility = 'visible';
        }
    };
    buttonTd.append(buttonChose);
    tr.append(avatarTd, nameTd, languagesTd, experienceTd, priceTd, buttonTd);
    table.append(tr);
}

function goToGuidesPage(page) {
    let totalPages = Math.ceil(filteredGuideList.length / GUIDES_PER_PAGE);
    clearGuidesTable();
    if (page < 1 || page > totalPages) {
        return;
    }
    for (
        let i = (page - 1) * GUIDES_PER_PAGE;
        i < page * GUIDES_PER_PAGE && i < filteredGuideList.length;
        i++) {
        addGuideToTable(
            filteredGuideList[i].id,
            filteredGuideList[i].language,
            filteredGuideList[i].name,
            filteredGuideList[i].pricePerHour,
            filteredGuideList[i].workExperience
        );
    }
    guideCurrentPage = page;
    // eslint-disable-next-line no-use-before-define
    renderGuidePaginationElement();
}

// Получение списка гидов
function getGuidesList(routeId) {
    sendGet(
        `${API_URL}/routes/${routeId}/guides`,
        function (response) {
            clearGuidesTable();
            let firstOption = document.getElementById('excursionLanguage');
            firstOption = firstOption.children[0];
            document.getElementById('excursionLanguage').innerHTML = '';
            document.getElementById('excursionLanguage').append(firstOption);
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

// Добавление маршрута в таблицу
function addRouteToTable(id, name, description, mainObject) {
    let table = document.getElementById('routeTable').children[0];

    let fullName = name;
    let fullDescription = description;
    let fullMainObject = mainObject;
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
            let otherRows = document.getElementById('routeTable');
            otherRows = otherRows.children[0].children;
            for (let i = 1; i < otherRows.length; i++) {
                otherRows[i].style.background = '';
            }
            tr.style.background = '#8fff55';
            chosenRoute = {
                id,
                name: fullName,
                description: fullDescription,
                mainObject: fullMainObject
            };
            showGuideSection(fullName);
            getGuidesList(id);
        }
    };
    buttonTd.append(buttonChose);
    tr.append(nameTd, descriptionTd, objectsTd, buttonTd);
    table.append(tr);
}

function goToRoutesPage(page) {
    let totalPages = Math.ceil(filteredRouteList.length / ROUTES_PER_PAGE);
    clearRouteTable();
    if (page < 1 || page > totalPages) {
        return;
    }
    for (
        let i = (page - 1) * ROUTES_PER_PAGE;
        i < page * ROUTES_PER_PAGE && i < filteredRouteList.length;
        i++
    ) {
        addRouteToTable(
            filteredRouteList[i].id,
            filteredRouteList[i].name,
            filteredRouteList[i].description,
            filteredRouteList[i].mainObject
        );
    }
    routeCurrentPage = page;
    // eslint-disable-next-line no-use-before-define
    renderRoutePaginationElement();
}

// создание кнопки
function createPageBtn(page, classes = [], isRoute = true) {
    let btn = document.createElement('button');
    classes.push('btn');
    for (let cls of classes) {
        btn.classList.add(cls);
    }
    if (isRoute) {
        btn.onclick = () => goToRoutesPage(page);
    } else {
        btn.onclick = () => goToGuidesPage(page);
    }
    btn.innerHTML = page;
    return btn;
}

// Рендер навигационных кнопок для пагинации
function renderRoutePaginationElement() {
    let paginationContainer = document.getElementById('paginationRoutes');
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
        buttonsContainer.append(
            createPageBtn(i, i === routeCurrentPage ? ['active'] : [])
        );
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
        buttonsContainer.append(
            createPageBtn(i, i === guideCurrentPage ? ['active'] : [], false)
        );
    }

    btn = createPageBtn(guideTotalPages, ['last-page-btn']);
    btn.onclick = () => goToGuidesPage(guideTotalPages);
    btn.innerHTML = 'Последняя страница';
    if (guideCurrentPage === guideTotalPages) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);
}

// Получение списка маршрутов
function getRouteList() {
    sendGet(
        'http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes',
        function (response) {
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
        }
    );
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
            if (routeName.includes(name)) {
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

// Фильтрация маршрутов по куску строки
function filterGuides() {
    let newGuides = [];
    if (currentSearchGuideLanguage === null ||
        currentSearchGuideLanguage === 'none') {
        newGuides = guideList;
    } else {
        let name = currentSearchGuideLanguage.toLowerCase().trim();
        for (let i = 0; i < guideList.length; i++) {
            let guide = guideList[i];
            let guideLanguage = guide.language.toLowerCase();
            if (guideLanguage.includes(name)) {
                newGuides.push(guide);
            }
        }
    }

    let newGuides2 = [];
    if (currentSearchExperienceFrom === null) {
        newGuides2 = newGuides;
    } else {
        for (let i = 0; i < newGuides.length; i++) {
            let guide = newGuides[i];
            if (guide.workExperience >= currentSearchExperienceFrom) {
                newGuides2.push(guide);
            }
        }
    }

    let newGuides3 = [];
    if (currentSearchExperienceTo === null) {
        newGuides3 = newGuides2;
    } else {
        for (let i = 0; i < newGuides2.length; i++) {
            let guide = newGuides2[i];
            if (guide.workExperience <= currentSearchExperienceTo) {
                newGuides3.push(guide);
            }
        }
    }

    filteredGuideList = newGuides3;
    guideTotalPages = Math.ceil(filteredGuideList.length / GUIDES_PER_PAGE);
    if (guideTotalPages === 0) {
        guideTotalPages = 1;
    }
    guideCurrentPage = 1;
    goToGuidesPage(1);
    renderGuidePaginationElement();
}

// Получение списка заявок
function getOrderList() {
    sendGet(`${API_URL}/orders`, function (response) {

    });
}

// Создание заявки
function createOrder(
    guideId,
    routeId,
    date,
    time,
    duration,
    persons,
    price,
    firstOption,
    secondOption
) {
    let formData = new FormData();
    formData.append('guide_id', guideId);
    formData.append('route_id', routeId);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('duration', duration);
    formData.append('persons', persons);
    formData.append('price', price);
    formData.append('optionFirst', firstOption);
    formData.append('optionSecond', secondOption);
    sendCUD(`${API_URL}/orders`, function (response) {
        console.log(response);
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
    sendCUD(`${API_URL}//orders/${orderId}`, function (response) {

    }, formData, 'PUT');
}

// Удаление заявки
function deleteOrder(orderId) {
    sendCUD(`${API_URL}//orders/${orderId}`, function (response) {

    }, null, 'DELETE');
}

// Получение заявки
function getOrder(orderId) {
    sendGet(`${API_URL}//orders/${orderId}`, function (response) {

    });
}

// Получение информации о гиде
function getGuide(guideId) {
    sendGet(`${API_URL}//guides/${guideId}`, function (response) {

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

function guideLanguageFilterPick(event) {
    let language = event.value;
    if (language === 'none') {
        currentSearchGuideLanguage = null;
    } else {
        currentSearchGuideLanguage = language;
    }
    filterGuides();
}

function experienceFromPick(event) {
    let number = event.value;
    if (number < 1) {
        currentSearchExperienceFrom = null;
    } else {
        currentSearchExperienceFrom = number;
    }
    filterGuides();
}

function experienceToPick(event) {
    let number = event.value;
    if (number < 1) {
        currentSearchExperienceTo = null;
    } else {
        currentSearchExperienceTo = number;
    }
    filterGuides();
}

function submitCreateOrder(form) {
    let elements = form.elements;
    let data = {};
    for (let i = 0 ; i < elements.length ; i++) {
        let item = elements.item(i);
        data[item.name] = item.value;
    }
    let holidays = {
        0: [1, 2, 3, 4, 5, 6, 7, 8], // январь
        1: [23], // февраль
        2: [8], // Март,
        4: [1, 9], // Май,
        5: [12], // Июнь,
        10: [4], // Ноябрь
    };
    let date = new Date(`${data.excursionDate} ${data.excursionStartTime}`);
    let month = date.getMonth();
    let day = date.getDate();
    let hours = date.getHours();
    let isHoliday = month in holidays && holidays[month].includes(day);

    let guideServiceCost = Number(chosenGuide.price);
    let hoursNumber = Number(data.excursionDuration);
    let numberOfVisitors = Number(data.excursionPeopleCount);
    if (numberOfVisitors <= 5) {
        numberOfVisitors = 0;
    } else if (numberOfVisitors <= 10) {
        numberOfVisitors = 1000;
    } else {
        numberOfVisitors = 1500;
    }
    let isThisDayOff = date.getDay() === 0
        || date.getDay() === 6 || isHoliday ? 1.5 : 1;
    let isItMorning = hours >= 9 && hours <= 12 ? 400 : 0;
    let isItEvening = hours >= 20 && hours <= 23 ? 1000 : 0;

    let price = guideServiceCost * hoursNumber
        * isThisDayOff + isItMorning + isItEvening + numberOfVisitors;

    let pensioners = document.getElementById('excursionOption1').checked;
    if (pensioners) {
        price = Math.round(0.75 * price);
    }
    let food = document.getElementById('excursionOption2').checked;
    if (food) {
        price += Number(data.excursionPeopleCount) * 1000;
    }

    createOrder(
        chosenGuide.id,
        chosenRoute.id,
        data.excursionDate,
        data.excursionStartTime,
        hoursNumber,
        Number(data.excursionPeopleCount),
        price,
        pensioners ? 1 : 0,
        food ? 1 : 0
    );

    closeOrderError();
    showSuccessMessage('Заявка была успешно оформлена');

    return false;
}

getRouteList();