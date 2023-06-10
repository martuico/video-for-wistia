import React, { useEffect, useState } from 'react';
import { Heading, Grid, GridItem, Pill, AssetCard, FormControl, TextInput, Flex } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import { fetchVideos } from '../api/wistia';
import { WistiaItem } from '../types';
import { css } from 'emotion';

const style = {
  pill: css`
   margin-bottom: 1rem;
   margin-right: 1rem;
  `,
}

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [selectedIds, setIds] = useState<number[]>([])
  const [data, updateData] = useState<WistiaItem[] | []>([])
  const [search, setSearch] = useState<string>('')
  sdk.window.startAutoResizer()
  const isSingle = sdk.parameters?.instance?.selectYesForSingleVideo === 'true';

  useEffect(() => {
    const fieldValues = sdk.field.getValue()
    console.log(fieldValues)
    setIds(
      fieldValues !== undefined && fieldValues.items && fieldValues.items.length > 0 ?
        fieldValues.items.map((item: WistiaItem) => item.id) : []
    );

    const parameters: any = sdk.parameters.installation;

    (async () => {
      const videoRequest = await fetchVideos(parameters.excludedProjects, parameters.apiBearerToken) || [];
      if (videoRequest.response.success) {
        updateData(videoRequest.videos || []);
      }
    })()

  }, [sdk.field, sdk.parameters.installation])


  const setNewValues = () => {
    const items = data && selectedIds.length > 0 ? data
      .filter(item =>
        selectedIds.findIndex((updatedId: number) => item.id === updatedId) !== -1
      )
      .map(item => {
        const values = {
          hashed_id: item.hashed_id,
          id: item.id,
          duration: item.duration,
          thumbnail: item.thumbnail
        }
        return values;
      }) : []
    
    sdk.field.setValue({ items })
  }

  const removeSelected = (id: any) => {
    const arr = [...selectedIds];
    arr.splice(arr.indexOf(id), 1);
    setIds(arr);
    sdk.field.setValue({ items: []})
  }

  /*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = useCMA();
  // If you only want to extend Contentful's default editing experience
  // reuse Contentful's editor components
  // -> https://www.contentful.com/developers/docs/extensibility/field-editors/
  return <FormControl>
    <FormControl.Label>Search for videos</FormControl.Label>
    <TextInput
      value={search}
      onChange={(event) => {
        setSearch(event.target.value);
      }} />
    <Heading>{isSingle ? ' Select a video' : 'Select videos'}</Heading>
    <FormControl.HelpText>
      Your list of selected video{isSingle ? '' : 's'}.
    </FormControl.HelpText>
    {selectedIds &&

      selectedIds.map((id) => {
        return <Pill
          key={id}
          className={style.pill}
          testId={id.toString()}
          label={data.find((item) => item.id === id)?.name || ''}
          onClose={() => removeSelected(id)}
          onDrag={() => { }}
        />
      })
    }
    <Grid style={{ width: 'fit-content', maxHeight: '350px', overflowY: 'scroll' }} columns="1fr 1fr 1fr 1fr" rowGap="spacingM" columnGap="spacingM">
      {data.map((item: WistiaItem) => (
        <GridItem key={item.id}>
          <AssetCard
            type="image"
            title={item.name}
            src={item.thumbnail?.url}
            size="small"
            onClick={() => {
              if (isSingle && selectedIds.length >= 1) {
                setIds([item.id])
              } else {
                setIds([...selectedIds, item.id])
              }
              setNewValues()
            }}
          />
        </GridItem>
      ))}
    </Grid>
  </FormControl >;
};

export default Field;
