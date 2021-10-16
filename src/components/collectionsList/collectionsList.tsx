import React from 'react';
import map from 'lodash/map';

import { Collection } from 'api';
import CollectionItem from 'components/collectionItem';
import Scrollable from 'components/scrollable';
import Title from 'components/title';

type Props = {
  title?: React.ReactNode;
  collections?: Collection[];
  loading?: boolean;
  onScrollToEnd?: () => void;
  scrollable?: boolean;
};

const CollectionsList: React.FC<Props> = ({ title, collections, loading, onScrollToEnd, scrollable = true }) => {
  const content = (
    <div>
      <Title>{title}</Title>
      <div className="flex flex-wrap pr-2">
        {map(collections, (collection) => (
          <CollectionItem key={collection.id} collection={collection} />
        ))}
        {loading && map([...new Array(15)], (_, idx) => <CollectionItem key={idx} />)}
      </div>
    </div>
  );

  return scrollable ? <Scrollable onScrollToEnd={onScrollToEnd}>{content}</Scrollable> : content;
};

export default CollectionsList;
