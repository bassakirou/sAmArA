import Widgets from './widgets';
import Copyright from './copyright';
import { footer } from './data';
import Subscription from '@components/common/subscription';
import Container from '@components/ui/container';

const { widgets, payment } = footer;

const Footer: React.FC = () => (
  <>
    <div className="newsletter">
      <Container>
        <Subscription className="px-5 py-12 bg-opacity-0 sm:px-16 xl:px-0 md:py-14 xl:py-16" />
      </Container>
    </div>
    <footer className="pt-2.5 lg:pt-10 2xl:pt-7 relative bg-gray-300">
      <div className="motif"></div>
      <Widgets widgets={widgets} />
      <Copyright payment={payment} />
    </footer>
  </>
);

export default Footer;
