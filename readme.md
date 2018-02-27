[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://travis-ci.org/jamesfer/react-with-observables.svg?branch=master)](https://travis-ci.org/jamesfer/react-with-observables)
[![Coverage Status](https://coveralls.io/repos/github/jamesfer/react-with-observables/badge.svg?branch=master)](https://coveralls.io/github/jamesfer/react-with-observables?branch=master)

# React with Observables

Write react components using nothing but functions and observables.

    /** @jsx ObsReact.createElement */
    import ObsReact from 'react-with-observables'
    
    const Timer = ObsReact.component(props => {
      const time$ = Rx.Observable.interval(1000)
      const minutes$ = time$.map(seconds => Math.floor(seconds / 60))
      const seconds$ = time$.map(seconds => seconds % 60)
      
      return <div className="timer">{ minutes$ }:{ seconds$ }</div>
    })

Whenever the time increments the component will automatically be rerendered
without you ever having to call `setState()`.

There are a number of other solutions out there at the moment that try to 
combine observables with react but I created this repo because I thought there 
should be an even simpler way.

Disclaimer: I'm not an expert in React, this is just an idea that I had been
thinking about for a while. Any feedback is welcome.

## How to use

The `/** @jsx ObsReact.createElement */` comment is required at top of each 
file that you use Observable jsx in. It tells babel to use 
`ObsReact.createElement` to create the jsx elements instead of 
`React.createElement`. Just like with normal react components, you have to 
import `ObsReact` into the file.

Each function component should also be wrapped in a `ObsReact.Component` call.
This creates a standard component class for your function automatically. `Timer`
in the above example is a standard react component.

## License

MIT License

Copyright (c) 2018 James Ferguson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
