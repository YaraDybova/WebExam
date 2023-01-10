const API_KEY = 'aabd4739-6934-4171-8805-bdcf1ee1eef8';
var routeList = [];

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
        routeList = response;
        clearRouteTable();
        for (let i = 0; i < routeList.length; i++) {
            addRouteToTable(
                routeList[i].id,
                routeList[i].name,
                routeList[i].description,
                routeList[i].mainObject
            );
        }
    });
}

// Фильтрация маршрутов по куску строки
function filterRoutes(name) {
    name = name.toLowerCase().trim();
    let newRoutes = [];
    if (name === null || name === '') {
        newRoutes = routeList;
    } else {
        for (let i = 0; i < routeList.length; i++) {
            let route = routeList[i];
            let routeName = route.name.toLowerCase();
            let description = route.name.toLowerCase();
            if (routeName.includes(name) || description.includes(name)) {
                newRoutes.push(route);
            }
        }
    }
    clearRouteTable();
    for (let i = 0; i < newRoutes.length; i++) {
        addRouteToTable(
            newRoutes[i].id,
            newRoutes[i].name,
            newRoutes[i].description,
            newRoutes[i].mainObject
        );
    }
}

function addRouteToTable(id, name, description, mainObject) {
    let table = document.getElementById('routeTable').children[0];

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
    buttonChose.onclick = function () {
        console.log(id);
    }
    buttonTd.append(buttonChose);
    tr.append(nameTd, descriptionTd, objectsTd, buttonTd);
    table.append(tr);
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
        return `${str.substring(0, maxLength)}...`
    }
    return str;
}

// Получение списка гидов
function getGuidesList(routeId) {
    sendGet(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/${routeId}/guides`, function (response) {

    });
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
    filterRoutes(event.value);
}

getRouteList();