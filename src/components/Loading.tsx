import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import './Loading.css';

// あらかじめ使用するアイコンを追加しておく
library.add(faSpinner);

type ContentProps = {
  isShowLoadingPopup: boolean;
};

const MemoComponent = (props: ContentProps) => {
  if (props.isShowLoadingPopup) {
    return (
      <div className='mx-auto'>
        <div className='loading-background'></div>
        <div className='loading'>
          通信中 <FontAwesomeIcon icon='spinner' spin />
        </div>
      </div>
    );
  }
  return null;
};

const Loading = React.memo(MemoComponent);

export default Loading;
