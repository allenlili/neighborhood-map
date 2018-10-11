"use strict";
/**
 * model
 */
let model = {
    data: [
        {title: 'UNSW Sydney', location: {lat: -33.917347, lng: 151.2312675}},
        {title: 'University of Sydney', location: {lat: -33.888584, lng: 151.1873473}},
        {title: 'Sydney Opera House', location: {lat: -33.8567844, lng: 151.2152967}},
        {title: 'Royal Botanic Gardens', location: {lat: -33.8641859, lng: 151.2143821}},
        {title: 'Museum of Sydney', location: {lat: -33.8661814, lng: 151.2086636}},
        {title: 'International Convention Centre Sydney', location: {lat: -33.8752151, lng: 151.1992241}},
        {title: 'Royal Randwick Racecourse', location: {lat: -33.9108925, lng: 151.20318}},
        {title: 'Bondi Beach', location: {lat: -33.8923541, lng: 151.2758928}}
    ]
};

/**
 * view model
 */
let initMap, map, largeInfoWindow;
let LocationsViewModel = function () {
    let self = this;
    initMap = function () {
        map = new google.maps.Map(document.querySelector('.map'), {
            center: {lat: -33.917347, lng: 151.2312675},
            zoom: 13,
            mapTypeControl: false
        });
        largeInfoWindow = new google.maps.InfoWindow();
        let bounds = new google.maps.LatLngBounds();
        let markers = [];
        for (let j = 0; j < model.data.length; j++) {
            let position = model.data[j].location;
            let title = model.data[j].title;
            let marker = new google.maps.Marker({
                position: position,
                title: title,
                animation: google.maps.Animation.DROP
            });
            model.data[j].marker = marker;
            marker.addListener('click', function () {
                populateInfoWindow(this, largeInfoWindow);
                toggleBounceWithTimeout(this, 3000);
            });
            marker.setMap(map);
            bounds.extend(marker.position);
            markers.push(marker);
        }
        map.fitBounds(bounds);
    };

    self.searchLocation = ko.observable('');
    self.locations = ko.computed(function () {
        let text = this.searchLocation();
        if (text !== '') {
            return filterInput(new RegExp(text, 'i'));
        }
        return model.data;
    }, this);
};

// filter of from clicking button
LocationsViewModel.prototype.filter = function () {
    let text = this.searchLocation();
    if (text !== '') {
        this.locations = ko.computed(function () {
            return filterInput(new RegExp(text, 'i'));
        }, this);
    }
};

// click list item and display info and animation
LocationsViewModel.prototype.display = function (place) {
    populateInfoWindow(place.marker, largeInfoWindow);
    toggleBounceWithTimeout(place.marker, 3000);
};

/**
 * helpers
 */
function filterInput(regex) {
    let rt = [];
    for (let i = 0; i < model.data.length; i++) {
        let found = model.data[i].title.search(regex);
        if (found !== -1) {
            model.data[i].marker.setMap(map);
            rt.push(model.data[i]);
        } else {
            model.data[i].marker.setMap(null);
        }
    }
    return rt;
}

function populateInfoWindow(marker, infoWindow) {
    if (infoWindow.marker !== marker) {
        infoWindow.marker = marker;
        infoWindow.setContent("");
        getExtraInfoFromWiki(marker, infoWindow);
        infoWindow.open(map, marker);
        infoWindow.addListener('closeclick', function () {
            infoWindow.marker = null;
        });
    }
}

function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

function toggleBounceWithTimeout(marker, timeout) {
    toggleBounce(marker);
    window.setTimeout(function () {
        toggleBounce(marker);
    }, timeout);
}

// credit: data from https://en.wikipedia.org
function getExtraInfoFromWiki(marker, infoWindow) {
    let url = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title;
    let rt;
    let wikiRequestTimeout = setTimeout(function () {
        rt = "Wiki Content Could Not Be Loaded! ⛔";
        infoWindow.setContent('<div><strong>' + marker.title + '</strong> from Wikipedia</div>' + rt);
    }, 5000);
    $.ajax({
        url: url,
        data: {
            format: 'json'
        },
        dataType: 'jsonp'
    }).done(function (data) {
        if (data) {
            let ul = document.createElement('ul');
            let li = document.createElement('li');
            let a = document.createElement('a');
            a.textContent = data[1][0];
            a.target = '_blank';
            a.href = data[3][0];
            li.appendChild(a);
            ul.appendChild(li);
            // if fallback is ok, stop timeout
            clearTimeout(wikiRequestTimeout);
            rt = ul.innerHTML;
            infoWindow.setContent('<div><strong>' + marker.title + '</strong> from Wikipedia' + '</div>' + rt);
        }
    }).fail(function (err) {
        rt = "Wiki Content Could Not Be Loaded! ⛔";
        infoWindow.setContent('<div><strong>' + marker.title + '</strong> from Wikipedia</div>' + rt);
    });
    return rt;
}

// loading map fails
setTimeout(function () {
    if (map === undefined) {
        let divMap = document.querySelector('.map');
        divMap.style.margin = 'auto';
        let h1 = document.createElement('h1');
        h1.style.textAlign = 'center';
        h1.style.color = 'white';
        h1.textContent = 'Could not load google map! ⛔️';
        divMap.appendChild(h1);
    }
}, 6000);

ko.applyBindings(new LocationsViewModel());
