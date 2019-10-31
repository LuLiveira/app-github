import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Lottie from 'lottie-react-native';
import { SafeAreaView } from 'react-native';
import carregamento from '../../assets/loading.json';

import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    pages: 1,
    loading: false,
  };

  async componentDidMount() {
    this.setState({
      loading: true,
    });

    const { pages } = this.state;
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(
      `/users/${user.login}/starred?page=${pages}`
    );

    this.setState({
      stars: response.data,
      loading: false,
    });
  }

  async componentDidUpdate(_, prevState) {
    const { pages, stars } = this.state;

    if (prevState.pages !== pages) {
      const { navigation } = this.props;
      const user = navigation.getParam('user');

      const response = await api.get(
        `/users/${user.login}/starred?page=${pages}`
      );

      this.setState({
        stars: stars.concat(response.data),
      });
    }
  }

  render() {
    const { navigation } = this.props;
    const { stars, pages, loading } = this.state;
    const user = navigation.getParam('user');

    if (loading) {
      return (
        <SafeAreaView>
          <Lottie
            source={carregamento}
            autoPlay
            loop
            width={400}
            height={400}
          />
        </SafeAreaView>
      );
    }

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name> {user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        <Stars
          onEndReached={() => this.setState({ pages: pages + 1 })}
          data={stars}
          keyExtractor={star => String(star.id)}
          renderItem={({ item }) => (
            <Starred>
              <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
              <Info>
                <Title>{item.name}</Title>
                <Author>{item.owner.login}</Author>
              </Info>
            </Starred>
          )}
        />
      </Container>
    );
  }
}
