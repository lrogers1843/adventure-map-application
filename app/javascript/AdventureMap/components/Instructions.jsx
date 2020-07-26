import React from 'react'

export default class Instructions extends React.Component {

    render() {
        if (this.props.display) {
        return (
            <div className="absolute z-10 h-full w-full top-0 left-0 flex content-center justify-center items-center">
            <div className="rounded md:w-1/3 w-1/2 border shadow-lg">
                <div className="rounded-t theme-background">
                    <div className="relative py-3 px-2 flex">
                        <span className="font-semibold md:text-base text-sm">Welcome to the Adventure Map!</span>
                        <div 
                        className="absolute right-0 top-0 -mr-2 -mt-2 border cursor-pointer shadow-lg bg-white z-10 p-1 rounded-full p-2 pt-1 pb-1" 
                        onClick={() => this.props.toggleInstructions()}
                        >
                            X    
                        </div>
                    </div>
                </div>
                <div className="bg-gray-200 md:text-base text-sm border-b p-2">
                    <ul className="list-disc list-outside ml-5">
                    <li>The menu on the left allows you to filter your activities by date and type</li>
                    <li>Don't forget to try out the map styles!</li>
                    <li>To learn more about and activity, just click the line on the map</li>
                    <li>Your activity information will then pop up, including any google photos taken during the activity</li>
                    <li>Hover over a photo to see its location on the map</li>
                    <li>Click the photo to make it larger</li>
                    <li>The "AutoZoom" button will expand (or shrink) the map to fit all the the filtered activities</li>
                    </ul>
                </div>
            </div>
            </div>
        )}
        return null
      }
}