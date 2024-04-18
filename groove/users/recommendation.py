import pandas as pd 
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


class Recommendation:
    """
    A class for generating song recommendations based on a user's listening history.

    Attributes:
        all_features (pandas.DataFrame): A dataframe containing feature vectors for all songs in the dataset.

    """

    all_features = pd.read_csv("./sample_songs/sample_final_features2.csv")
    all_features.set_index('id', inplace=True)
    
    def __init__(self, song_id=None, feature_vector=None) -> None:
        """
        Initializes a new instance of the Recommendation class.
        Provide either song_id or user feature vector

        :param song_id: The ID of a song to be used as the initial feature vector .
        :param feature_vector: A feature vector to be used as the initial vector.
        """

        if song_id is not None and feature_vector is not None:
            raise ValueError("You can only pass either song_id or feature_vector, not both.")
              
        if feature_vector is not None:
            self.feature = feature_vector
        elif song_id is not None:
            self.feature = self.all_features.loc[song_id]
        else:
            raise ValueError("You must pass either song_id or feature_vector.")                
        

    @classmethod
    def update_user_vector(cls, song_id, user_vector) -> np.ndarray:
        """
        Updates a user's feature vector with a new song.

        :param song_id: The ID of the new song to be added to the user's feature vector.
        :param user_vector: The user's current feature vector.
        :return: The updated user vector, normalized.
        """
        user_vector += cls.all_features.loc[song_id] 
        user_vector_normalized = user_vector / np.linalg.norm(user_vector)
        return user_vector_normalized

    @classmethod
    def undo_update(cls, song_id, user_vector) -> np.ndarray:
        """
        Undoes an update to a user's feature vector.

        :param song_id: The ID of the song to be removed from the user's feature vector.
        :param user_vector: The user's current feature vector.
        :return: The updated user vector, normalized.
        """
        user_vector -= cls.all_features.loc[song_id] 
        user_vector_normalized = user_vector / np.linalg.norm(user_vector)
        return user_vector_normalized

    @classmethod
    def average_features_liked_songs(cls,song_ids) -> tuple[bool,np.ndarray]:
        """
        Averages the feature vectors of a list of liked songs.

        :param song_ids: A list of song IDs to be averaged.
        :return: A tuple containing a boolean indicating whether any song IDs were found,
                and the average feature vector.
        """
        if song_ids:
            try:
                liked_feature_vectors = cls.all_features.loc[song_ids].values
                return True, np.mean(liked_feature_vectors, axis=0)    
            except KeyError:
                return False, np.array([])  
        else:
            return False, np.array([])


    def similar_song_ids(self) -> pd.core.indexes.base.Index:
        """
        Finds the IDs of songs similar to the current feature vector.

        :return: A pandas Index containing the IDs of similar songs.
        """

        # Compute cosine similarity between vector and feature vectors of all songs
        similarity_scores = cosine_similarity([self.feature], self.all_features.values).flatten()
        
        
        similar_song_indices = np.argsort(similarity_scores)[::-1][1:]

        similar_songs_ids = self.all_features.iloc[similar_song_indices].index
        
        return similar_songs_ids
    

 