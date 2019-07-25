/**
 * Action type
 */
export const SHOW_MODAL = 'SHOW_MODAL';
export const CLOSE_MODAL = 'CLOSE_MODAL';

/**
 * Action Creator
 */
export const showModalActionCreator = (onHide) => ({
  type: SHOW_MODAL,
  onHide,
});

export const closeModalActionCreator = (onHide) => ({
  type: CLOSE_MODAL,
  onHide,
});