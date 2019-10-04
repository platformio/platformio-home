import MultiPage from '@Core/components/multipage';
import React from 'react';
import routes from './routes';


export default class InspectPage extends React.Component {

  render() {
    return (
      <section className='inspect-module'>
        <MultiPage routes={ routes } />
      </section>
    );
  }
}
