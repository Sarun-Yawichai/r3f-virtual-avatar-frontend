import { Link } from "react-router-dom";
import { useEffect, useMemo } from "react";

const Home = () => {
    return (
        <div className="flex fixed top-0 left-0 right-0 bottom-0 flex-row">
            <div class="header w-full h-20 bg-black">
                <div class="logo p-3 pl-5">
                    <Link to="/">
                        <h1 class="text-purple-900 text-3xl font-bold">GenWiz</h1>
                        <p class="text-white text-xs font-normal">Knowledge Intelligence</p>
                    </Link>
                </div>
            </div>
            <div className="flex fixed top-20 left-0 right-0 bottom-0 justify-center items-center">
                <Link to="/Chat"><button class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"> Start </button></Link>
            </div>
        </div>
    )
}

export default Home