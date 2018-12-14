import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions';

import UpDefaultTheme from '../../../Common/theming'
import { ThemeProvider as UpThemeProvider } from '../../../Common/theming/ThemeProvider'

import { withKnobs, text, boolean, number } from '@storybook/addon-knobs';
import UpButton from './UpDropFile'
import UpBox from '../../Containers/Box';
import UpNotification from '../../Display/Notification';
import UpParagraph from '../../Display/Paragraph';
import UpDropFile from './UpDropFile';

const stories = storiesOf('Inputs/UpDropFile', module) ;
stories.addDecorator(withKnobs);
stories.add('Simple usage',
() => {
 const actionType = text('actionType', 'add');
 const intent = text('intent', 'primary');
 
 return <UpThemeProvider theme={UpDefaultTheme}>
   <UpBox style={{margin:"40px 30px"}}>
     <UpNotification intent={"info"}>
         Le composant <code>UpDropFile</code> permet de définir ...
         <UpParagraph>
            <UpDropFile label={'File'} name={'file'}>
             Add
           </UpDropFile>
        </UpParagraph>
     </UpNotification>
   </UpBox>
 </UpThemeProvider>
}, { info : "Utilisation du composant en lui passant les données à afficher" }
)