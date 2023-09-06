import { useState } from 'react';
import Login from './Login';
import {ChatRoom} from './ChatRoom'

function App() {

	const [isLoggedIn, setIsLoggedIn] = useState(false);

	return (
		<div className="App">
			<div className="min-h-screen flex flex-col w-full items-center justify-center bg-color-movement ">
				<div className="app-container max-w-lg  p-6 bg-white rounded-lg shadow-lg m-8">
					{isLoggedIn ? <ChatRoom /> : <Login setIsLoggedIn={setIsLoggedIn} />}
				</div>
			</div>
		</div>
	);
}

export default App;