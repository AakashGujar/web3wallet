import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { Toaster } from "../components/ui/sonner"

const Home = () => {
  return (
    <Provider store={store}>
      <section className="px-12 lg:px-48 md:px-24 sm:px-12">
        <main className="py-4 w-full flex flex-col items-center min-h-[90vh]">
          <Navbar />
          <Hero />
        </main>
        <Footer />
        <Toaster />
      </section>
    </Provider>
  );
};

export default Home;
