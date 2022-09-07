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

      if (value.totalHits == 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        refs.gallery.textContent = '';
        refs.searchForm.reset();
        return;
      }

      refs.gallery.textContent = '';
      const markup = createCards(value.hits);
      refs.gallery.insertAdjacentHTML('afterbegin', markup);
      Notify.success(`Hooray! We found ${totalHits} images.`);
      lightbox.refresh();
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
      refs.gallery.insertAdjacentHTML('beforeend', createCards(value.hits));
      totalHits += value.hits.length;
      lightbox.refresh();
    })
    .catch(error => {
      console.log(error);
      refs.loadMoreBtn.classList.add('is-hidden');
      Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      Notify.success(`Hooray! We found ${totalHits} images.`);
      return error;
    });
}

const lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});
