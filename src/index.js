import './css/styles.css';
import fetchCountries from './fetchCountries'; 
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import createCards from './createCards';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  gallery: document.querySelector('.gallery'),
  searchForm: document.querySelector('.search-form'),
  loadMoreBtn: document.querySelector('.load-more'),
};

let currentPage = 1;
let searchValue = '';
let totalHits = 0;

refs.searchForm.addEventListener('submit', searchImage);
refs.loadMoreBtn.addEventListener('click', onClickLoadMoreBtn);

async function searchImage(event) {
  event.preventDefault();
  searchValue = event.currentTarget.searchQuery.value;
  currentPage = 1;

  if (searchValue === '') {
    Notify.failure('Enter something.');
    refs.gallery.textContent = '';
    refs.searchForm.reset();
    refs.loadMoreBtn.classList.add('is-hidden');
    return;
  }

  await fetchCountries(searchValue, currentPage)
    .then(value => {
      totalHits = value.hits.length;

      if (value.totalHits > 40) {
        refs.loadMoreBtn.classList.remove('is-hidden');
      } else {
        refs.loadMoreBtn.classList.add('is-hidden');
      }

      if (value.totalHits > 0) {
        refs.gallery.textContent = '';
        const markup = createCards(value.hits);
        refs.gallery.insertAdjacentHTML('afterbegin', markup);
        Notify.success(`Hooray! We found ${totalHits} images.`);
        lightbox.refresh();
      }

      if (value.totalHits === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        refs.gallery.textContent = '';
        refs.searchForm.reset();
        refs.loadMoreBtn.classList('is-hidden');
        return;
      }
    })
    .catch(error => {
      console.log(error);
      return error;
    });
}

async function onClickLoadMoreBtn() {
  currentPage += 1;
  await fetchCountries(searchValue, currentPage)
    .then(value => {
      if (totalHits === value.totalHits) {
        refs.loadMoreBtn.classList.add('is-hidden');
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }

      totalHits += value.hits.length;
      refs.gallery.insertAdjacentHTML('beforeend', createCards(value.hits));
      lightbox.refresh();
    })
    .catch(error => {
      console.log(error);
      refs.loadMoreBtn.classList.add('is-hidden');
      Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      return error;
    });
}

const lightbox = new SimpleLightbox('.photo-card a', {
  captionPosition: 'bottom',
  animationSpeed: 250,
  captionsData: 'alt',
});
