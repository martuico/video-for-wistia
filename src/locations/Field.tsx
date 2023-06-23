import React, { useEffect, useState } from 'react';
import { Heading, Paragraph, Grid, GridItem, Pill, AssetCard, FormControl, TextInput, Skeleton } from '@contentful/f36-components';
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
  const [searchData, setSearchData] = useState<WistiaItem[] | []>([])
  const [originalData, setOriginalData] = useState<WistiaItem[] | []>([])
  const [search, setSearch] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  sdk.window.startAutoResizer()
  const isSingle = sdk.parameters?.instance?.selectYesForSingleVideo;

  useEffect(() => {
    const fieldValues = sdk.field.getValue()
    const selectedIdsItems = fieldValues && fieldValues.items ?
      fieldValues.items.map((item: WistiaItem) => item.id) : []

    setIsLoading(true)
    const parameters: any = sdk.parameters.installation;
    (async () => {
      const videoRequest: any = await fetchVideos(parameters.excludedProjects, parameters.apiBearerToken) || [];
      if (videoRequest.response.success) {
        const videosR = videoRequest.videos.map((vid: WistiaItem) => ({ ...vid, isSelected: selectedIds.includes(vid.id) }))
        updateData(videosR || []);
        setOriginalData(videosR || []);
      }
      setIds(selectedIdsItems);
      setIsLoading(false)
    })()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdk.field, sdk.parameters.installation])

  useEffect(() => {
    if (selectedIds) {
      const x = data.map((item: WistiaItem) => {
        if (selectedIds.includes(item.id)) {
          item.isSelected = true
        } else {
          item.isSelected = false
        }
        return { ...item }
      })
      updateData(x)
      setNewValues()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds])

  const setSelecteData = (item: WistiaItem) => {
    if (isSingle) {
      setIds([item.id])
    } else {
      setIds([...selectedIds, item.id])
    }
  }



  const setNewValues = () => {
    const items = data
      .filter((item: WistiaItem) =>
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
      })

    sdk.field.setValue({ items })
  }

  const removeSelected = (id: any) => {
    const arr = [...selectedIds];
    const dataArr = [...data];
    const projectIdx = arr.indexOf(id)
    const dataIdx = dataArr.indexOf(id)
    if (dataArr[dataIdx] && dataArr[dataIdx].isSelected) dataArr[dataIdx].isSelected = false
    updateData(dataArr)
    arr.splice(projectIdx, 1);
    setIds(arr);
    sdk.field.setValue({ items: [] })
  }

  const updateDataBySearch = (search: string) => {
    if (search === '') {
      setSearchData(originalData)
      updateData(originalData)
      return
    }

    const filteredData = data.filter((item: WistiaItem) => {
      return (item.name && item.name.indexOf(search) > -1)
    });
    setSearchData(filteredData);
    updateData(filteredData);
  }

  return (
    data ?
      <>
        <FormControl>
          <FormControl.Label>Search for videos</FormControl.Label>
          <TextInput
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              updateDataBySearch(event.target.value);
            }} />
          {search && (
            <>
              <Paragraph>{searchData.length} results found</Paragraph>
            </>
          )}

          <Heading>{isSingle ? ' Select a video' : 'Select videos'}</Heading>
          <FormControl.HelpText>
            Your list of selected video{isSingle ? '' : 's'}.
          </FormControl.HelpText>
          {!isLoading && selectedIds && selectedIds.length > 0 &&
            selectedIds.map((id) => {
              return <Pill
                key={id}
                className={style.pill}
                testId={id.toString()}
                label={originalData.find((item) => item.id === id)?.name || ''}
                onClose={() => removeSelected(id)}
                onDrag={() => { }}
              />
            })
          }
          {!isLoading ?
            <Grid style={{ width: 'fit-content', maxHeight: '350px', overflowY: 'scroll' }} columns="1fr 1fr 1fr 1fr" rowGap="spacingM" columnGap="spacingM">
              {data && data.map((item: WistiaItem) => (
                <GridItem key={item.id}>
                  <AssetCard
                    type="image"
                    title={item.name}
                    src={item.thumbnail?.url}
                    size="small"
                    style={{ border: `${item.isSelected ? '2px solid purple' : 'none'}` }}
                    onClick={(e) => {
                      e.preventDefault()
                      if (selectedIds.includes(item.id)) {
                        return
                      }
                      setSelecteData(item)
                      item.isSelected = true
                    }}
                  />
                  <Paragraph>{item.id + '-' + item.name}</Paragraph>
                </GridItem>
              ))}
            </Grid>
            :
            <Skeleton.Container>
              <Skeleton.BodyText numberOfLines={4} />
            </Skeleton.Container>
          }

        </FormControl >
      </> :
      <>
        <Paragraph>No videos found</Paragraph>
        <Skeleton.Container>
          <Skeleton.BodyText numberOfLines={4} />
        </Skeleton.Container>
      </>
  )
};

export default Field;
