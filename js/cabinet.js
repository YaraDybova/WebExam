const API_KEY = 'aabd4739-6934-4171-8805-bdcf1ee1eef8';
const API_URL = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru/api';
const ORDERS_PER_PAGE = 10;

let ordersCurrentPage = 1;
let ordersTotalPages;
let ordersList = [];
let filteredOrdersList = [];

// Маршрурты, для сопоставления
let routes = [];

function showSuccessMessage(text) {
    document.getElementById('successBlock').style.display = 'flex';
    document.getElementById('successMessage').innerHTML = text;
}

function closeSuccessMessage() {
    document.getElementById('successMessage').innerHTML = '';
    document.getElementById('successBlock').style.display = 'none';
}

document.addEventListener("DOMContentLoaded", function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const message = urlParams.get('message');
    if (message !== null) {
        showSuccessMessage(message);
    }
});

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

// Добавление заявки в таблицу
function addRouteToTable(id, route, date, price) {
    let table = document.getElementById('routeTable').children[0];
    route = makeShorter(route, 50);

    let tr = document.createElement('tr');
    let idTd = document.createElement('td');
    idTd.innerHTML = id;
    let routeId = document.createElement('td');
    routeId.innerHTML = route;
    let dateTd = document.createElement('td');
    dateTd.innerHTML = date;
    let priceTd = document.createElement('td');
    priceTd.innerHTML = price;
    let buttonsTd = document.createElement('td');
    buttonsTd.innerHTML = 'кнопочки';
    tr.append(idTd, routeId, dateTd, priceTd, buttonsTd);
    table.append(tr);
}

function goToRoutesPage(page) {
    let totalPages = Math.ceil(filteredOrdersList.length / ORDERS_PER_PAGE);
    clearRouteTable();
    if (page < 1 || page > totalPages) {
        return;
    }
    for (
        let i = (page - 1) * ORDERS_PER_PAGE;
        i < page * ORDERS_PER_PAGE && i < filteredOrdersList.length;
        i++
    ) {
        addRouteToTable(
            filteredOrdersList[i].id,
            routes.find(r => r.id === filteredOrdersList[i].route_id).name,
            filteredOrdersList[i].date,
            `${filteredOrdersList[i].price}`
        );
    }
    ordersCurrentPage = page;
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
    if (ordersCurrentPage === 1) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);

    let buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('pages-btns');
    paginationContainer.append(buttonsContainer);

    let start = Math.max(ordersCurrentPage - 2, 1);
    let end = Math.min(ordersCurrentPage + 2, ordersTotalPages);
    for (let i = start; i <= end; i++) {
        buttonsContainer.append(
            createPageBtn(i, i === ordersCurrentPage ? ['active'] : [])
        );
    }

    btn = createPageBtn(ordersTotalPages, ['last-page-btn']);
    btn.onclick = () => goToRoutesPage(ordersTotalPages);
    btn.innerHTML = 'Последняя страница';
    if (ordersCurrentPage === ordersTotalPages) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);
}

// Получение списка заявок
function getOrderList() {
    sendGet(`${API_URL}/orders`, function (response) {
        ordersTotalPages = Math.ceil(response.length / ORDERS_PER_PAGE);
        ordersCurrentPage = 1;
        ordersList = response;
        filteredOrdersList = response;

        goToRoutesPage(1);
    });
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
    sendCUD(`${API_URL}/orders/${orderId}`, function (response) {

    }, formData, 'PUT');
}

// Удаление заявки
function deleteOrder(orderId) {
    sendCUD(`${API_URL}/orders/${orderId}`, function (response) {

    }, null, 'DELETE');
}

// Получение заявки
function getOrder(orderId) {
    sendGet(`${API_URL}/orders/${orderId}`, function (response) {

    });
}

// Получение информации о гиде
function getGuide(guideId) {
    sendGet(`${API_URL}/guides/${guideId}`, function (response) {

    });
}

// Получение списка маршрутов
function getRouteList() {
    sendGet(
        `${API_URL}/routes`,
        function (response) {
            routes = response;
            getOrderList();
        }
    );
}

getRouteList();