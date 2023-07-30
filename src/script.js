import axios from "axios";
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const searchForm = document.querySelector(".search-form");
const gallery = document.querySelector(".gallery");
const loadBtn = document.querySelector(".load-more");

const simpleLightbox = new SimpleLightbox(".gallery a");

const BASE_URL = "https://pixabay.com/api/";
let id = '';
let page = 1;
let totalPhoto = 0;

loadBtn.hidden = true;

searchForm.addEventListener('submit', handlerSearch);
loadBtn.addEventListener('click', onClick);

async function handlerSearch(evt) {
  evt.preventDefault();
  gallery.innerHTML = '';
  id = evt.currentTarget[0].value;
  try {
    await fetchPhoto(id)
    .then((arr) => {
      if (arr.length === 0) {
        Notiflix.Notify.info("Sorry, there are no images matching your search query. Please try again.")
      } else {
        page = 1;
        Notiflix.Notify.info(`Hooray! We found ${totalPhoto} images.`) 
        gallery.insertAdjacentHTML('beforeend', createMarkupImg(arr))
        simpleLightbox.refresh();
        loadBtn.hidden = false;
      }
    })
  } catch (error) {
    console.log(error.message)
  }
  // finally {
  //   evt.target.reset()
  // }
}

async function onClick() {
  try {
    page += 1;
    if (totalPhoto >= page * 40) {
      await fetchPhoto(id, page)
        .then((array) => {
          gallery.insertAdjacentHTML('beforeend', createMarkupImg(array))
          simpleLightbox.refresh()
          pageScrolling()
        })
    } else {
      loadBtn.hidden = true;
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.")
    }
  } catch (error) {
        console.log(error.message)}
}

async function fetchPhoto(id, page = 1){
  const parameters = new URLSearchParams({
    key: "38534494-dd699be6f177c9dcf9ffa3976",
    q : id,
    image_type : "photo",
    orientation: "horizontal",
    safesearch : true,
    per_page: 40,
    page: `${page}`
  });  

  const {data} = await axios.get(`${BASE_URL}?${parameters}`);
  totalPhoto = data.totalHits;
  const array = data.hits;
  
  return array;
}

function createMarkupImg(array) {
  return array.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) =>
    `<div class="photo-card">
  <a href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes "${likes}"</b>
    </p>
    <p class="info-item">
      <b>Views "${views}"</b>
    </p>
    <p class="info-item">
      <b>Comments "${comments}"</b>
    </p>
    <p class="info-item">
      <b>Downloads "${downloads}"</b>
    </p>
  </div>
</div>`).join('')
}

function pageScrolling() {
  const { height: cardHeight } = document
    .querySelector(".gallery")
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });
}
