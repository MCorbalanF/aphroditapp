import { Appbar } from 'react-native-paper';

export default function NavBar(props) {
  if(props.route.name !== 'auth') {
    return null;
  }
  return (
    null
  );
}