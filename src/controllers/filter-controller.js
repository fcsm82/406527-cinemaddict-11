import Filter from "../components/filter";
import {FilterType, ExtraFilterType, FilterNames, ExtraFilterNames} from "../util/filter";

import {render, replace} from "../util/dom-util";
import {getFilmsByFilter} from "../util/filter";

export default class FilterController {
  constructor(container, moviesModel) {
    this._container = container;
    this._moviesModel = moviesModel;


    this._activeFilterType = FilterType.ALL;
    this._filterComponent = null;

    this._onDataChange = this._onDataChange.bind(this);
    this._onFilterChange = this._onFilterChange.bind(this);

    this._moviesModel.setDataChangeListener(this._onDataChange);
  }

  render() {
    const container = this._container;
    const films = this._moviesModel.films;

    const filters = Object.values(FilterType).map((filterType) => {
      return {
        type: filterType,
        name: FilterNames[filterType.toUpperCase()],
        count: getFilmsByFilter(films, filterType).length,
        active: filterType === this._activeFilterType,
      };
    });

    const extraFilters = Object.values(ExtraFilterType).map((filterType) => {
      return {
        type: filterType,
        name: ExtraFilterNames[filterType.toUpperCase()],
        active: filterType === this._activeFilterType,
      };
    });

    const oldComponent = this._filterComponent;

    this._filterComponent = new Filter(filters, extraFilters);
    this._filterComponent.setFilterChangeListener(this._onFilterChange);

    if (oldComponent) {
      replace(this._filterComponent, oldComponent);
      this.setOnMenuItemClick(this._onMenuItemClick);
    } else {
      render(container, this._filterComponent);
    }
  }

  _onFilterChange(filterType) {
    if (this._activeFilterType === filterType) {
      return;
    }

    this._moviesModel.setFilter(filterType);
    this._activeFilterType = filterType;

    this.render();
  }

  _onDataChange() {
    this.render();
  }

  setOnMenuItemClick(listener) {
    this._filterComponent.setFilterChangeListener(listener);

    this._onMenuItemClick = listener;
  }
}
