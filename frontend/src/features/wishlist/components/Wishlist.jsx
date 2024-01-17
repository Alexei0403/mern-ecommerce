import { Box, Button, Grid, IconButton, Paper, Stack, TextField, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {useDispatch,useSelector} from 'react-redux'
import { createWishlistItemAsync, deleteWishlistItemByIdAsync, resetWishlistItemAddStatus, resetWishlistItemDeleteStatus, resetWishlistItemUpdateStatus, selectWishlistItemAddStatus, selectWishlistItemDeleteStatus, selectWishlistItemUpdateStatus, selectWishlistItems, updateWishlistItemByIdAsync } from '../WishlistSlice'
import {ProductCard} from '../../products/components/ProductCard'
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { emptyWishlistAnimation } from '../../../assets';
import Lottie from 'lottie-react' 
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useForm } from "react-hook-form"
import {addToCartAsync, resetCartItemAddStatus, selectCartItemAddStatus, selectCartItems} from '../../cart/CartSlice'

export const Wishlist = () => {

  const dispatch=useDispatch()
  const wishlistItems=useSelector(selectWishlistItems)
  const wishlistItemAddStatus=useSelector(selectWishlistItemAddStatus)
  const wishlistItemDeleteStatus=useSelector(selectWishlistItemDeleteStatus)
  const wishlistItemUpdateStatus=useSelector(selectWishlistItemUpdateStatus)
  const loggedInUser=useSelector(selectLoggedInUser)
  const cartItems=useSelector(selectCartItems)
  const cartItemAddStatus=useSelector(selectCartItemAddStatus)

  const [editIndex,setEditIndex]=useState(-1)
  const [editValue,setEditValue]=useState('')
  const {register,handleSubmit,watch,formState: { errors }} = useForm()

  
  const handleAddRemoveFromWishlist=(e,productId)=>{
    if(e.target.checked){
        const data={user:loggedInUser?._id,product:productId}
        dispatch(createWishlistItemAsync(data))
    }

    else if(!e.target.checked){
        const index=wishlistItems.findIndex((item)=>item.product._id===productId)
        dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
    }
  } 

  useEffect(()=>{
    if(wishlistItemAddStatus==='fulfilled'){
        toast.success("Product added to wishlist")
    }
    else if(wishlistItemAddStatus==='rejected'){
        toast.error("Error adding product to wishlist, please try again later")
    }

    return ()=>{
        dispatch(resetWishlistItemAddStatus())
    }

  },[wishlistItemAddStatus])

  useEffect(()=>{
    if(wishlistItemDeleteStatus==='fulfilled'){
        toast.success("Product removed from wishlist")
    }
    else if(wishlistItemDeleteStatus==='rejected'){
        toast.error("Error removing product from wishlist, please try again later")
    }

    return ()=>{
        dispatch(resetWishlistItemDeleteStatus())
    }
  },[wishlistItemDeleteStatus])


  useEffect(()=>{
    if(wishlistItemUpdateStatus==='fulfilled'){
      toast.success("Wislist item updated")
    }
    else if(wishlistItemUpdateStatus==='rejected'){
      toast.error("Error updating wishlist item")
    }

    setEditIndex(-1)
    setEditValue("")

    return ()=>{
      dispatch(resetWishlistItemUpdateStatus())
    }
  },[wishlistItemUpdateStatus])

  useEffect(()=>{

    if(cartItemAddStatus==='fulfilled'){
        toast.success("Product added to cart")
    }

    else if(cartItemAddStatus==='rejected'){
        toast.error('Error adding product to cart, please try again later')
    }

    return ()=>{
        dispatch(resetCartItemAddStatus())
    }

},[cartItemAddStatus])


  const handleNoteUpdate=(wishlistItemId)=>{
    const update={_id:wishlistItemId,note:editValue}
    dispatch(updateWishlistItemByIdAsync(update))
  }

  const handleEdit=(index)=>{
    setEditValue(wishlistItems[index].note)
    setEditIndex(index)
  }

  const handleAddToCart=(productId)=>{
    const data={user:loggedInUser?._id,product:productId}
    dispatch(addToCartAsync(data))
  }


  return (
    // parent
    <Stack justifyContent={'flex-start'} mt={5} mb={5} alignItems={'center'}>

        {/* main child */}
        <Stack width={'70rem'} rowGap={4}>

          {/* heading area and back button */}
          <Stack alignSelf={'flex-start'} flexDirection={'row'} columnGap={1} justifyContent={'center'} alignItems={'center'}>
              <IconButton component={Link} to={'/'}><ArrowBackIcon fontSize='large'/></IconButton>
              <Typography variant='h4' fontWeight={500}>Your wishlist</Typography>
          </Stack>

          {/* product grid */}
          <Stack>

            {
              wishlistItems?.length===0?(
                <Stack width={'40rem'} alignSelf={'center'} justifyContent={'center'} alignItems={'center'}>
                  <Lottie animationData={emptyWishlistAnimation}/>
                  <Typography variant='h6' fontWeight={300}>You have no items in your wishlist</Typography>
                </Stack>
              ):
            
              <Grid container gap={3} justifyContent={'center'}>
                {
                  wishlistItems.map((item,index)=>(
                    <Stack component={Paper} elevation={1} >

                      <ProductCard item key={item._id} brand={item.product.brand.name} id={item.product._id} price={item.product.price} stockQuantity={item.product.stockQuantity} thumbnail={item.product.thumbnail} title={item.product.title} handleAddRemoveFromWishlist={handleAddRemoveFromWishlist} isWishlistCard={true}/>
                      
                      <Stack p={2}>

                        {/* note heading and icon */}
                        <Stack flexDirection={'row'} alignItems={'center'}>
                          <Typography variant='h6' fontWeight={400}>Note</Typography>
                          <IconButton onClick={()=>handleEdit(index)} ><EditOutlinedIcon/></IconButton>
                        </Stack>

                        {
                          editIndex===index?(

                            <Stack rowGap={2}>
                              
                              <TextField multiline rows={4} value={editValue} onChange={(e)=>setEditValue(e.target.value)}/>
                              
                              <Stack flexDirection={'row'} alignSelf={'flex-end'} columnGap={1}>
                                  <Button onClick={()=>handleNoteUpdate(item._id)} size='small' variant='contained'>Update</Button>
                                  <Button onClick={()=>setEditIndex(-1)} size='small' variant='outlined' color='error'>Cancel</Button>
                              </Stack>

                            </Stack>
                          ):
                          <Box width={'300px'}>
                            <Typography sx={{wordWrap:"break-word"}}>{item.note?item.note:"You can add a note here"}</Typography>
                          </Box>
                        }

                        {
                          cartItems.some((cartItem)=>cartItem.product._id===item.product._id)?
                          <Button sx={{mt:4}} size='small' variant='outlined' component={Link} to={'/cart'}>Already in cart</Button>:<Button sx={{mt:4}} size='small' onClick={()=>handleAddToCart(item.product._id)} variant='outlined'>Buy</Button>
                        }
                        
                        
                      </Stack>
                    </Stack>
                  ))
                }
              </Grid>
            }
          </Stack>
        
        </Stack>
        
    </Stack>
  )
}
