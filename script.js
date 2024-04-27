
const list = document.querySelector('.main__list')

const filmsPages = () => {

    let releases = document.querySelector('.releases')
    let premieres = document.querySelector('.premieres')
    let expected = document.querySelector('.expected')
    let popular = document.querySelector('.popular')
    let favorite = document.querySelector('.favorite')
    let input = document.querySelector('.header__input')
    let logo = document.querySelector('.header__title')

    initializationPages(releases, premieres, expected, popular, favorite, input, logo)
}


const initializationPages = (releases, premieres, expected, popular, favorite, input, logo) => {

    const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"]

    const form = document.querySelector('.header__form')
    const currentYear = new Date().getFullYear()
    const currentMonth = months[new Date().getMonth()]


    activeNavLink()

    logo.addEventListener('click', () => {
        getPremieresMonth(currentYear, currentMonth)
        clearActiveNavLinks()
    })

    form.addEventListener('submit', (e) => searchFilms(e, input))
    premieres.addEventListener('click', () => getPremieresMonth(currentYear, currentMonth))
    expected.addEventListener('click', () => getExpectedFilms(getExpectedFilms))
    popular.addEventListener('click', () => getTopPopular(getTopPopular))
    releases.addEventListener('click', () => getReleasesMonth(currentYear, currentMonth))
    favorite.addEventListener('click', () => displayFavorites())


    getPremieresMonth(currentYear, currentMonth)

}


const activeNavLink = () => {
    const items = document.querySelectorAll('.header__item')

    items.forEach(item => {
        item.addEventListener('click', () => {
            items.forEach(otherItem => otherItem.classList.remove('header__item_active'))
            item.classList.add('header__item_active')
        })
    })
}

const clearActiveNavLinks = () => {
    const items = document.querySelectorAll('.header__item')
    items.forEach(item => item.classList.remove('header__item_active'))
}

const searchFilms = (e, input) => {
    e.preventDefault()

    const SEARCH_URL = `https://kinopoiskapiunofficial.tech/api/v2.2/films?keyword=${input.value}`

    clearActiveNavLinks()

    if (window.innerWidth <= 1120){
        clearActiveNavBurgerLinks()
    }

    input.value = ``
    list.innerHTML = ''

    fetchRequest(SEARCH_URL)
}

const getPremieresMonth = (currentYear, currentMonth) => {
    const PREMIERES_MONTH_URL = `https://kinopoiskapiunofficial.tech/api/v2.2/films/premieres?year=${currentYear}&month=${currentMonth}`
    fetchRequest(PREMIERES_MONTH_URL)
}

const getTopPopular = () => {
    const TOP_POPULAR_URL = `https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_POPULAR_ALL`
    fetchRequest(TOP_POPULAR_URL)
}

const getExpectedFilms = () => {
    const EXPECTED_FILMS_URL = `https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_POPULAR_MOVIES`
    fetchRequest(EXPECTED_FILMS_URL)
}

const getReleasesMonth = (currentYear, currentMonth) => {

    const URL = `https://kinopoiskapiunofficial.tech/api/v2.1/films/releases?year=${currentYear}&month=${currentMonth}`

    fetch(URL, {
        method: 'GET',
        headers: {
            'X-API-KEY': '74f90391-8e44-460f-b9d2-47e39e76eb34',
            'Content-Type': 'application/json',
        },
    })
        .then(res => res.json())
        .then(json => {
            list.innerHTML = ``
            const films = json.releases
            showFilms(films)

        })
        .catch(err => console.log(err))
}

const fetchRequest = (URL) => {

    fetch(URL, {
        method: 'GET',
        headers: {
            'X-API-KEY': '74f90391-8e44-460f-b9d2-47e39e76eb34',
            'Content-Type': 'application/json',
        },
    })
        .then(res => res.json())
        .then(json => {
            list.innerHTML = ``
            const films = json.items
            showFilms(films)
        })
        .catch(err => console.log(err))
}


const showFilms = (films) => {

    if (!films.length){

        const emptyTitle = document.createElement('h2')
        emptyTitle.classList.add('main__item-empty')

        emptyTitle.textContent = "По вашему запросу ничего не найдено!"
        list.appendChild(emptyTitle)
    }

    films.forEach(film => {

        const item = document.createElement('div')

        createItemFilm(film, item)

        let favoriteBtn = item.querySelector('.icon-heart-empty')
        if (favoriteBtn !== null && item) {
            favoriteBtn.addEventListener('click', () => {
                addFavorite(film, item)
            });
        }

        list.appendChild(item)
    })

}
const createItemFilm = (film, item) => {
    item.classList.add('main__item')

    const rating = !film.rating ? 9 : film.rating
    const genres = film.genres.map((item, idx) => ` ${item.genre}`).filter((_, idx) => idx < 3)
    const url = film.posterUrlPreview || film.posterUrl
    const title = film.nameRu || film.nameEn || film.nameOriginal

    const favorite = isFavorite(film.kinopoiskId || film.filmId)

    item.innerHTML = `
                <span class="main__item-rating">${rating.toFixed(1)}</span>
                    <img class="main__item-img" src=${url} alt="">
                    <h5 class="main__item-title">${title}</h5>
                    <p class="main__item-year">${film.year}</p>
                    <p class="main__item-genres">${genres}</p>
                    <i class="icon-heart-empty main__item-favorite ${favorite ? "main__item-favorite_active" : "main__item-favorite"}"></i>
            `
}

const updateLocalStorage = () => {
    return JSON.parse(localStorage.getItem('favorites')) || []
}

const displayFavorites = () => {

    list.innerHTML = ''

    let favoritesFilms = JSON.parse(localStorage.getItem('favorites')) || []

    if (!favoritesFilms.length) {

        const emptyTitle = document.createElement('h2')
        emptyTitle.classList.add('main__item-empty')

        emptyTitle.textContent = "Ваш список избранных пуст!"
        list.appendChild(emptyTitle)
    } else {
        favoritesFilms.forEach(film => {

            const item = document.createElement('div')

            createItemFilm(film, item)

            const favoriteBtn = item.querySelector('.icon-heart-empty')
            if (favoriteBtn !== null && item) {
                favoriteBtn.addEventListener('click', () => {
                    removeFromFavoritesPage(film, item)
                })
            }
            list.appendChild(item)
        })
    }
}

const removeFromFavoritesPage = (film, item) => {

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoriteBtn = item.querySelector('.icon-heart-empty');

    if (film){


        favorites = favorites.filter(favorite => {
            let favoriteId = favorite.kinopoiskId || favorite.filmId
            let filmId = film.kinopoiskId || film.filmId
            return  favoriteId !== filmId
        });
        favoriteBtn.classList.remove('main__item-favorite_active');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));

    displayFavorites()
}

const isFavorite = (id) => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || []

    const isFavoriteFilm = updateLocalStorage()

    if (favorites !== null){
        return isFavoriteFilm.some(item => {
            let itemId = item.kinopoiskId || item.filmId
            return itemId === id
        })
    }
}




const addFavorite = (film, item) => {

    let favorites = JSON.parse(localStorage.getItem('favorites')) || []
    const favoriteBtn = item.querySelector('.icon-heart-empty')

    if (favorites) {
        const hasMatch = favorites.some(favorite => {
            let favoriteId = favorite.kinopoiskId || favorite.filmId
            let filmId = film.kinopoiskId || film.filmId

            if (favoriteId !== undefined && filmId !== undefined){
                return  favoriteId === filmId
            }
            return undefined
        })

        if (hasMatch) {
            favorites = favorites.filter(favorite => {
                let favoriteId = favorite.kinopoiskId || favorite.filmId
                let filmId = film.kinopoiskId || film.filmId
                return favoriteId !== filmId
            })
            favoriteBtn.classList.remove('main__item-favorite_active')
        } else {
            favorites.push(film);
            favoriteBtn.classList.add('main__item-favorite_active')
        }
        localStorage.setItem('favorites', JSON.stringify(favorites))
    } else {
        let newFavorites = [film];
        favoriteBtn.classList.add('main__item-favorite_active')
        localStorage.setItem('favorites', JSON.stringify(newFavorites))
    }
}



const activeNavBurgerLinks = () => {
    const burgerItems = document.querySelectorAll('.burger__item')

    burgerItems.forEach(item => {
        item.addEventListener('click', () => {
            burgerItems.forEach(otherItem => otherItem.classList.remove('burger__item_active'))
            item.classList.add('burger__item_active')
        })
    })
}

const clearActiveNavBurgerLinks = () => {
    const items = document.querySelectorAll('.burger__item')
    items.forEach(item => item.classList.remove('burger__item_active'))
}

const initializationBurgerPages = () => {

    const releases = document.querySelector('.burger-releases')
    const premieres = document.querySelector('.burger-premieres')
    const expected = document.querySelector('.burger-expected')
    const popular = document.querySelector('.burger-popular')
    const favorite = document.querySelector('.burger-favorite')
    const input = document.querySelector('.header__input')
    const logo = document.querySelector('.header__title')

    initializationPages(releases, premieres, expected, popular, favorite, input, logo)
}

document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('.main')
    const burgerMenu = document.querySelector('.burger__menu')
    const burgerMenuBtn = document.querySelector('.burger__menu-btn')

    const openOrCloseBurgerMenu = () => {
           burgerMenu.classList.toggle('burger__menu_active')
    }

    const handleClickOutsideMenu = (e) => {
        if (!e.target.classList.contains('burger__menu-btn')) {
            burgerMenu.classList.remove('burger__menu_active')
        }
        if (burgerMenu.classList.contains('burger__menu_active')){
            main.style.filter = 'blur(3px)'
        }else {
            main.style.filter = 'none'
        }
    }
    window.addEventListener('scroll', () => {
        if (window.scrollY > 85 && burgerMenu.classList.contains('burger__menu_active')) {
            burgerMenu.classList.add('burger__menu_active-fixed')
        }else if (window.scrollY < 80 && burgerMenu.classList.contains('burger__menu_active')){
            burgerMenu.classList.remove('burger__menu_active-fixed')
        }
    })

    const handleClickBurgerMenu = () => {
        burgerMenuBtn.addEventListener('click', () => {
            openOrCloseBurgerMenu()
            activeNavBurgerLinks()
        });
    }

    document.addEventListener('click', handleClickOutsideMenu)
    handleClickBurgerMenu()
})


if (window.innerWidth <= 1120){
    initializationBurgerPages()
}else{
    filmsPages()
}