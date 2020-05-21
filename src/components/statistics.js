import AbstractSmart from "./abstract-smart";
import {getUserRank} from "./user-rank";
import Chart from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
// import moment from "moment";
import {getFilmsByFilter} from "../util/filter";

const filterNames = [`All time`, `Today`, `Week`, `Month`, `Year`];
const DEFAULT_FILTER = `all-time`;
const SERVER_URL = `https://echo.htmlacademy.ru/`;

export default class Statistics extends AbstractSmart {
  constructor(moviesModel) {
    super();

    this._moviesModel = moviesModel;
    this._chart = null;
    this._renderChart();
    this._filter = DEFAULT_FILTER;
    this._onFilterChange();
  }

  getTemplate() {
    const films = getFilmsByFilter(this._moviesModel.films, this._filter);
    const filterMarkup = this._createFilterMarkup(this._filter);
    const watchedFilmsAmount = films.length;
    const userRank = getUserRank(films);
    const watchedFilms = films.filter((film) => film.isInHistory);
    const totalFilmDuration = this._getTotalFilmDuration(watchedFilms);
    const filmsByGenres = this._getFilmsAmountByGenre(films);
    const topGenre = films.length ? filmsByGenres[0].genre : ``;

    return (
      `<section class="statistic">
      <p class="statistic__rank">
        Your rank
        <img class="statistic__img" src="images/bitmap@2x.png" alt="Avatar" width="35" height="35">
        <span class="statistic__rank-label">${userRank}</span>
      </p>
      <form action="${SERVER_URL}" method="get" class="statistic__filters">
        <p class="statistic__filters-description">Show stats:</p>
        ${filterMarkup}
      </form>
      <ul class="statistic__text-list">
        <li class="statistic__text-item">
          <h4 class="statistic__item-title">You watched</h4>
          <p class="statistic__item-text">${watchedFilmsAmount} <span class="statistic__item-description">movies</span></p>
        </li>
        <li class="statistic__text-item">
          <h4 class="statistic__item-title">Total duration</h4>
          <p class="statistic__item-text">${totalFilmDuration.hours} <span class="statistic__item-description">h</span> ${totalFilmDuration.minutes} <span class="statistic__item-description">m</span></p>
        </li>
        <li class="statistic__text-item">
          <h4 class="statistic__item-title">Top genre</h4>
          <p class="statistic__item-text">${topGenre}</p>
        </li>
      </ul>
      <div class="statistic__chart-wrap">
        <canvas class="statistic__chart" width="1000"></canvas>
      </div>
    </section>`
    );
  }

  _getFilterIdByName(filterName) {
    let filterId = ``;
    filterId = (filterName === `All time`) ? `all-time` : filterName.toLowerCase();

    return filterId;
  }

  _createFilterMarkup(filter) {
    return filterNames
    .map((name) => {
      return (
        `<input type="radio"
          class="statistic__filters-input visually-hidden"
          name="statistic-filter"
          id="statistic-${this._getFilterIdByName(name)}"
          value="${this._getFilterIdByName(name)}" ${this._getFilterIdByName(name) === filter ? `checked` : ``}
        >
        <label for="statistic-${this._getFilterIdByName(name)}" class="statistic__filters-label">
          ${name}
        </label>`
      );
    })
    .join(`\n`);
  }

  _getFilmGenres(films) {
    return films.reduce((filmGenres, film) => {
      film.genres.forEach((it) => {
        if (!filmGenres.includes(it)) {
          filmGenres.push(it);
        }
      });
      return filmGenres;
    }, []);
  }

  _getFilmsAmountByGenre(films) {
    const filmGenres = this._getFilmGenres(films);

    return filmGenres.map((genre) => {
      return {
        genre,
        count: films.filter((film) => film.genres.includes(genre)).length,
      };
    }).sort((a, b) => b.count - a.count);
  }

  _getTotalFilmDuration(films) {
    let totalDuration = {
      hours: 0,
      minutes: 0,
    };
    const totalFilmDuration = films.reduce((total, film) => total + film.runtime, 0);
    totalDuration.hours = Math.floor(totalFilmDuration / 60);
    totalDuration.minutes = totalFilmDuration % 60;
    return totalDuration;
  }

  _getGenresCtx() {
    return this.getElement().querySelector(`.statistic__chart`);
  }

  renderChart(films) {
    const BAR_HEIGHT = 50;
    const chartData = this._getFilmsAmountByGenre(films);

    const genresCtx = this._getGenresCtx();
    genresCtx.height = BAR_HEIGHT * chartData.length;

    const chart = {
      plugins: [ChartDataLabels],
      type: `horizontalBar`,
      data: {
        labels: chartData.map((it) => it.genre),
        datasets: [{
          data: chartData.map((it) => it.count),
          backgroundColor: `#ffe800`,
          hoverBackgroundColor: `#ffe800`,
          anchor: `start`,
          barThickness: 24
        }]
      },
      options: {
        plugins: {
          datalabels: {
            font: {
              size: 20
            },
            color: `#ffffff`,
            anchor: `start`,
            align: `start`,
            offset: 40,
          }
        },
        scales: {
          yAxes: [{
            ticks: {
              fontColor: `#ffffff`,
              padding: 100,
              fontSize: 20
            },
            gridLines: {
              display: false,
              drawBorder: false
            },
          }],
          xAxes: [{
            ticks: {
              display: false,
              beginAtZero: true
            },
            gridLines: {
              display: false,
              drawBorder: false
            },
          }],
        },
        legend: {
          display: false
        },
        tooltips: {
          enabled: false
        }
      }
    };

    return new Chart(genresCtx, chart);
  }

  show(updatedFilms) {
    super.show();

    this._films = updatedFilms;
    this.rerender();
  }

  recoverListeners() {
    this._onFilterChange();
  }

  rerender() {
    super.rerender();

    this._renderChart();
  }

  _renderChart() {
    const films = getFilmsByFilter(this._moviesModel.films, this._filter);
    this._resetChart();

    this._chart = this.renderChart(films);
  }

  _resetChart() {
    if (this._chart) {
      this._chart.destroy();
      this._chart = null;
    }
  }

  _onFilterChange() {
    this.getElement().querySelector(`.statistic__filters`)
      .addEventListener(`change`, (evt) => {
        this._filter = evt.target.value;
        this.rerender();
      });
  }
}
