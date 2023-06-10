import React, { useEffect, useState } from 'react';
import { Paragraph, Form, FormControl } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import { fetchVideos } from '../api/wistia';
import { WistiaItem } from '../types';

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [selectedIds, setIds] = useState<number[]>([])
  const [data, updateData] = useState<WistiaItem[] | []>([])

  console.log(sdk)
  useEffect(() => {
    const fieldValues = sdk.field.getValue()
    setIds(
      fieldValues !== undefined && fieldValues.items.length > 0 ?
        fieldValues.items.map((item: WistiaItem) => item.id) : []
    );

    const parameters: any = sdk.parameters.installation;

    (async () => {
      const videoRequest = await fetchVideos(parameters.excludedProjects, parameters.apiBearerToken) || [];
      console.log(videoRequest)
      if (videoRequest.response.success) {
        updateData(videoRequest.videos || []);
      }
    })()

  }, [sdk.field, sdk.parameters.installation])
  /*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = useCMA();
  // If you only want to extend Contentful's default editing experience
  // reuse Contentful's editor components
  // -> https://www.contentful.com/developers/docs/extensibility/field-editors/
  return <FormControl>
    <FormControl.Label>{sdk.parameters?.instance?.selectYesForSingleVideo ? ' Select a video' : 'Select videos'}</FormControl.Label>
  </FormControl>;
};

export default Field;
